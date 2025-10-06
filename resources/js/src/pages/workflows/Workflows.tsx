import { BaseForm } from '@/components/form/base/base-form';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormInput } from '@/components/form/base/form-input';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormTextArea } from '@/components/form/base/form-textarea';
import { FormLayout } from '@/components/form/FormLayout';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import axios from 'axios';
import { Edit, Eye, Play, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormGroup } from 'react-reactive-form';
import { useNavigate } from 'react-router';
import { Subject } from 'rxjs';
import { toast } from 'sonner';
import WorkflowDeleteDialog from './WorkflowDeleteDialog';
import EmptyState from '@/partials/common/EmptyState';
import { useAuthContext } from '@/auth';
import yaml from 'js-yaml';

export interface Workflow {
  id: number;
  name: string;
  slug: string;
  description: string;
  definition: string;
  created_at: string;
}

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteData, setDeleteData] = useState<Workflow | undefined>();
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter workflow name',
      hint: 'Unique name, no special characters',
      required: true
    }),
    new FormTextArea({
      name: 'description',
      label: 'Describe',
      type: 'text',
      placeholder: 'Describe the workflow step details',
      hint: 'A brief description of the workflow',
      defaultLength: 3
    }),
    new FormCheckBox({
      name: 'use_ai',
      label: 'Use AI Agent',
      value: false
    }),
    new FormSubmit({
      label: `Create Workflow`,
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/workflows`);
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to fetch workflows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreate = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const newWorkflow = await axios.post(`${import.meta.env.VITE_APP_API_URL}/workflows`, values);
      setWorkflows((prev) => [...prev, newWorkflow.data]);
      formGroup.reset();
      submitted$.next(true);
      setShowModal(true);
      navigate(`/admin/workflow/definition`, {
        state: {
          workflow: newWorkflow.data
        }
      });
    } catch (err) {
      console.error('Failed to create workflow', err);
    } finally {
      submitted$.next(true);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/workflows/${deleteData?.id}`);
      toast.success(`${deleteData?.name} deleted successfully`);
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteData?.id));
    } catch (error) {
      toast.error('Error deleting record');
    }
  };

  const getFirstStepRoles = (wf: Workflow): string[] => {
    try {
      const def = yaml.load(wf.definition || '') as any;
      return def?.steps?.[0]?.roles ?? [];
    } catch (e) {
      console.error('Invalid workflow definition', e);
      return [];
    }
  };

  const hasRoleAccess = (wf: Workflow): boolean => {
    const firstStepRoles = getFirstStepRoles(wf) ?? [];
    const userRoles = currentUser?.roles ?? [];
    return userRoles.some((role: string) => firstStepRoles.includes(role));
  };

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Workflows`} />
          <ToolbarDescription>Manage all your workflows effectively</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          {currentUser?.roles.includes('super') && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
          )}
        </ToolbarActions>
      </Toolbar>

      {/* Workflow Cards Grid */}
      {loading ? (
        <p>Loading workflows...</p>
      ) : workflows.length === 0 ? (
        <EmptyState
          title="Add New Workflow"
          description="Design and automate your business processes with intuitive, <br />powerful workflows that help streamline tasks and improve team efficiency."
          buttonText="Create Workflow"
          onButtonClick={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mt-8">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-white rounded shadow hover:shadow-lg transition p-4 border border-gray-200 flex flex-col justify-between relative"
            >
              <button
                onClick={() => {
                  setDeleteModalOpen(true);
                  setDeleteData(wf);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <div>
                <h2 className="text-xl font-semibold mb-4">{wf.name}</h2>
                <p className="text-gray-600 mb-4 text-md line-clamp-3">
                  {wf.description || 'No description'}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Created: {new Date(wf.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between gap-2 mt-4">
                <button
                  className="btn btn-sm btn-light"
                  disabled={!currentUser?.roles.includes('super')}
                  onClick={() => {
                    navigate('/admin/workflow/definition', {
                      state: {
                        workflow: wf
                      }
                    });
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span className="max-sm:hidden">
                    {wf.definition ? 'Edit' : 'Create'} Definition
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate(`/admin/workflow/${wf.slug}`)}
                    disabled={!wf.definition || !hasRoleAccess(wf)}
                  >
                    <Play className="h-4 w-4" />
                    <span className="max-sm:hidden">Start</span>
                  </button>
                  <button
                    className="btn btn-sm btn-primary btn-primary"
                    onClick={() => {
                      navigate(`/admin/workflow/${wf.slug}/instances`);
                    }}
                    disabled={!wf.definition}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="max-sm:hidden">Histories</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Workflow */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Create Workflow</h2>
            <FormLayout formLayout={formLayout} onSubmitForm={handleCreate} />
          </div>
        </div>
      )}
      <WorkflowDeleteDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        data={deleteData}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Workflows;
