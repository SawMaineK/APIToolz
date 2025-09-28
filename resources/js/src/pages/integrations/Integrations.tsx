import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions
} from '@/partials/toolbar';
import { toAbsoluteUrl } from '@/utils';
import EmptyState from '@/partials/common/EmptyState';
import { FormInput } from '@/components/form/base/form-input';
import { BaseForm } from '@/components/form/base/base-form';
import { FormTextArea } from '@/components/form/base/form-textarea';
import { FormSelect } from '@/components/form/base/form-select';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';
import { useNavigate } from 'react-router';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';

export interface Integration {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  definition: string;
  slug: string;
  type?: string;
  active: boolean;
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter integration name',
      required: true
    }),
    new FormTextArea({
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Description for integration',
      hint: 'A brief description of the integration',
      defaultLength: 3
    }),
    new FormInput({
      name: 'logo_url',
      label: 'Logo URL',
      type: 'text',
      placeholder: 'Enter logo url https://'
    }),
    new FormSelect({
      name: 'type',
      label: 'Type',
      options$: async () => [
        { label: 'Payment', value: 'payment' },
        { label: 'SMS', value: 'sms' }
      ]
    }),
    new FormSubmit({
      label: `Create Integration`,
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/integrations`);
      setIntegrations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const int = await axios.post(`${import.meta.env.VITE_APP_API_URL}/integrations`, values);
      setIntegrations((prev) => [...prev, int.data]);
      formGroup.reset();
      submitted$.next(true);
      setShowModal(true);
      navigate(`/admin/integration/definition`, {
        state: {
          integration: int.data
        }
      });
    } catch (err) {
      console.error('Failed to create integration', err);
    } finally {
      submitted$.next(true);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;
    try {
      await axios.delete(`/api/integrations/${slug}`);
      setIntegrations((prev) => prev.filter((i) => i.slug !== slug));
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const toggleActive = async (slug: string, currentStatus: boolean) => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/integrations/${slug}`, {
        active: !currentStatus,
        _method: 'PUT'
      });
      setIntegrations((prev) =>
        prev.map((i) => (i.slug === slug ? { ...i, active: !currentStatus } : i))
      );
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Integrations`} />
          <ToolbarDescription>Enhance Workflows with Advanced Integrations.</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Start Integration
          </button>
        </ToolbarActions>
      </Toolbar>

      {/* Integrations Grid */}
      {loading ? (
        <div>Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <EmptyState
          title="Add New Integration"
          description="Connect your apps seamlessly and automate workflows with powerful, <br>easy-to-use integrations designed to enhance productivity and streamline your processes."
          buttonText="Start Integration"
          onButtonClick={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5 my-8">
          {integrations.map((int, key) => (
            <div className="card" key={key}>
              <div className="card-content p-5 lg:p-7.5">
                <div className="flex items-center justify-between mb-3 lg:mb-5">
                  <div className="flex items-center justify-center">
                    <img
                      alt=""
                      className="h-11 shrink-0"
                      src={
                        int.logo_url
                          ? `${int.logo_url}`
                          : toAbsoluteUrl('/media/brand-logos/jira.svg')
                      }
                    />
                  </div>
                  <div className="btn btn-sm btn-icon btn-ghost">
                    <i className="ki-filled ki-exit-right-corner"></i>
                  </div>
                </div>
                <div className="flex flex-col gap-1 lg:gap-2.5">
                  <span className="text-base font-semibold text-mono hover:text-primary">
                    {int.name}
                  </span>
                  <span className="text-sm line-clamp-2 min-h-[2rem]">{int.description}</span>
                </div>
              </div>
              <div className="card-footer justify-between items-center py-3.5">
                <button
                  className="btn btn-light"
                  onClick={() => {
                    navigate('/admin/integration/definition', {
                      state: {
                        integration: int
                      }
                    });
                  }}
                >
                  <i className="ki-filled ki-mouse-square"></i>
                  Definition
                </button>
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={int.active}
                    onCheckedChange={() => toggleActive(int.slug, int.active)}
                  />
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
            <h2 className="text-xl font-bold mb-4">Create Integration</h2>
            <FormLayout formLayout={formLayout} onSubmitForm={handleCreate} />
          </div>
        </div>
      )}
    </div>
  );
};
export default Integrations;
