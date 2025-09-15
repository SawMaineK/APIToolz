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

export interface Workflow {
  id: number;
  name: string;
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
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter workflow name',
      hint: 'Unique name, no spaces or special characters',
      required: true
    }),
    new FormTextArea({
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Describe the workflow details',
      hint: 'A brief description of the workflow',
      required: true,
      defaultLength: 3
    }),
    new FormCheckBox({
      name: 'use_ai',
      label: 'Use AI Agent'
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
      const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/workflow`);
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
      const newWorkflow = await axios.post(`${import.meta.env.VITE_APP_API_URL}/workflow`, values);
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
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/workflow/${deleteData?.id}`);
      toast.success(`${deleteData?.name} deleted successfully`);
      setWorkflows((prev) => prev.filter((w) => w.id !== deleteData?.id));
    } catch (error) {
      toast.error('Error deleting record');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Workflows`} />
          <ToolbarDescription>Manage all your workflows effectively</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Create Workflow
          </button>
        </ToolbarActions>
      </Toolbar>

      {/* Workflow Cards Grid */}
      {loading ? (
        <p>Loading workflows...</p>
      ) : workflows.length === 0 ? (
        <p>No workflows available.</p>
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
                <h2 className="text-xl font-semibold mb-4 uppercase">{wf.name}</h2>
                <p className="text-gray-600 mb-4 text-md line-clamp-3">
                  {wf.description || 'No description'}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Created: {new Date(wf.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="btn btn-sm btn-light"
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
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => navigate(`/admin/workflow/${wf.name}`)}
                  disabled={!wf.definition}
                >
                  <Play className="h-4 w-4" />
                  <span className="max-sm:hidden">Start</span>
                </button>
                <button
                  className="btn btn-sm btn-primary btn-primary"
                  onClick={() => console.log('View History', wf.id)}
                  disabled={!wf.definition}
                >
                  <Eye className="h-4 w-4" />
                  <span className="max-sm:hidden">View History</span>
                </button>
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
