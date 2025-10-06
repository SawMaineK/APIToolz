import { useState, useMemo } from 'react';
import { FormLayout } from '@/components/form/FormLayout';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormCoder } from '@/components/form/base/form-coder';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import axios from 'axios';
import { toast } from 'sonner';
import { Workflow } from './Workflows';
import yaml from 'js-yaml';
import { Edit, Network } from 'lucide-react';
import { WorkflowBuilder } from './WorkflowBuilder';

interface WorkflowDefinitionProps {
  workflow: Workflow;
}

const WorkflowDefinition = ({ workflow }: WorkflowDefinitionProps) => {
  const [viewMode, setViewMode] = useState<'editor' | 'diagram'>('editor');
  const [definition, setDefinition] = useState(workflow.definition || ``);

  const initialValues = {
    name: workflow.name,
    description: workflow.description,
    definition: definition
  };

  const formLayout: BaseForm<string>[] = [
    new FormCoder({
      name: 'definition',
      config: {
        height: '400px',
        defaultLanguage: 'yaml'
      }
    }),
    new FormSubmit({
      label: `Submit Changes`,
      display: 'flex flex-col gap-1',
      altClass: 'flex',
      inputClass: `flex justify-center`
    })
  ];

  // ✅ Only save to API when user explicitly clicks "Submit"
  const formSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/workflows/${workflow.id}`, {
        id: workflow.id,
        name: workflow.name,
        definition: values.definition,
        _method: 'PUT'
      });
      setDefinition(values.definition);
      toast.success('Changes have been successfully applied.');
      submitted$.next(true);
    } catch (error: any) {
      console.error('Form submission failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        formGroup.setErrors({ submit: data.message });
        if (data.errors && status === 400) {
          Object.entries(data.errors).forEach(([field, message]) => {
            if (formGroup.get(field)) {
              if (message instanceof Array) {
                message.forEach((msg: any) => {
                  formGroup.get(field)?.setErrors({ serverError: msg });
                });
              } else {
                formGroup.get(field)?.setErrors({ serverError: message });
              }
            }
          });
        }
      } else {
        console.error('Unexpected Error:', error?.message || error);
      }
    } finally {
      submitted$.next(true);
    }
  };

  // Parse YAML workflow for diagram
  const parsedWorkflow = useMemo(() => {
    try {
      const wf = yaml.load(definition || '') as any;
      if (!wf) return null;
      return {
        name: wf.name || workflow.name,
        steps: wf.steps || []
      };
    } catch (e) {
      console.warn('Invalid YAML, cannot render diagram:', e);
      return null;
    }
  }, [definition, workflow.name]);

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Workflow Definition`} />
          <ToolbarDescription>
            Define the workflow structure and steps using YAML format or visualize it as a diagram.
          </ToolbarDescription>
        </ToolbarHeading>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setViewMode('editor')}
            className={`btn btn-sm ${viewMode === 'editor' ? 'btn-primary' : 'btn-light'}`}
          >
            <Edit className="w-4 h-4" /> YAML Editor
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            className={`btn btn-sm ${viewMode === 'diagram' ? 'btn-primary' : 'btn-light'}`}
          >
            <Network className="w-4 h-4" /> Diagram
          </button>
        </div>
      </Toolbar>

      <div className="mt-6">
        {viewMode === 'editor' && (
          <FormLayout
            initValues={initialValues}
            formLayout={formLayout}
            onSubmitForm={formSubmit}
          />
        )}

        {viewMode === 'diagram' && parsedWorkflow && (
          <WorkflowBuilder
            workflow={parsedWorkflow}
            onWorkflowChange={(wf) => {
              // ✅ Only update local YAML, no API call here
              const yamlDef = yaml.dump(wf, { noRefs: true });
              setDefinition(yamlDef);
            }}
          />
        )}

        {viewMode === 'diagram' && !parsedWorkflow && (
          <div className="p-4 bg-red-100 text-red-600 rounded">
            Invalid YAML definition. Please fix in editor.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDefinition;
