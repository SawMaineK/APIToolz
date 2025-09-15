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
import _ from 'lodash';
import { describe } from 'node:test';

interface WorkflowDefinitionProps {
  workflow: Workflow;
}

const WorkflowDefinition = ({ workflow }: WorkflowDefinitionProps) => {
  const initialValues = {
    name: workflow.name,
    description: workflow.description,
    definition: workflow.definition || ``
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

  const formSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/workflow/${workflow.id}`, {
        id: workflow.id,
        name: workflow.name,
        definition: values.definition,
        _method: 'PUT'
      });
      toast.success('Changes have been successfully applied.');
      submitted$.next(true);
    } catch (error: any) {
      console.error('Form submission failed:', error);
      // Set error state in the form
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

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Workflow Definition`} />
          <ToolbarDescription>
            Define the workflow structure and steps using YAML format.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      <div className="mt-6">
        <FormLayout
          initValues={initialValues}
          formLayout={formLayout}
          onSubmitForm={formSubmit}
        ></FormLayout>
      </div>
    </div>
  );
};

export default WorkflowDefinition;
