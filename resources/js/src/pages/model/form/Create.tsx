import { toast } from 'sonner';
import axios from 'axios';
import { ModelContentProps } from '../_models';
import { FormLayout } from '@/components/form/FormLayout';
import { Link, useNavigate } from 'react-router-dom';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { Subject } from 'rxjs';
import { generateFormLayout, objectToFormData, toFormLayout } from '../_helper';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { KeenIcon } from '@/components/keenicons';
import { useAuthContext } from '@/auth';

const Create = ({ model, modelData, isModal, onCreated }: ModelContentProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();

  // ✅ Permission checks
  const canCreate = currentUser?.permissions?.some((perm) => perm === 'create');
  const canEdit = currentUser?.permissions?.some((perm) => perm === 'edit');
  const hasRole = currentUser?.roles?.some((role) => role === 'super');

  const initialValues = {
    ...modelData
  };

  const formLayout: BaseForm<string>[] = model.config.formLayout
    ? toFormLayout(model.config.formLayout, model.config.forms)
    : [
        ...generateFormLayout(model.config.forms || []),
        new FormSubmit({
          label: `Submit`,
          display: 'flex flex-col gap-1',
          altClass: 'flex',
          inputClass: `flex justify-center ${isModal ? 'grow' : ''}`
        })
      ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const formData = objectToFormData(value);

      if (modelData) {
        formData.append('_method', 'PUT');
        formData.append('id', modelData.id);
      }

      const url =
        `${import.meta.env.VITE_APP_API_URL}/${model.slug}` + (modelData ? `/${modelData.id}` : '');
      const result = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: '' // Add token if needed
        }
      });

      toast.success(`Successfully ${modelData ? 'updated' : 'created'}`);
      submitted$.next(true);

      if (isModal) {
        formGroup.reset();
        onCreated?.(result.data);
      } else {
        formGroup.reset();
        navigate(`/admin/model/${model.slug}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Form submission failed:', error);

      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        formGroup.setErrors({ submit: data.message });
        if (data.errors && status === 400) {
          Object.entries(data.errors).forEach(([field, message]) => {
            if (formGroup.get(field)) {
              if (Array.isArray(message)) {
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

  // ✅ Determine required permission
  const isEditMode = !!modelData;
  const hasPermission = isEditMode ? canEdit : canCreate;

  // ✅ If user doesn’t have permission, block access
  if (!hasPermission) {
    return (
      <div className="p-6 text-center text-gray-500">
        <h2 className="text-lg font-semibold">
          {isEditMode
            ? 'You do not have permission to edit this record.'
            : 'You do not have permission to create a new record.'}
        </h2>
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-light mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      {isModal ? (
        <div>
          <FormLayout
            initValues={initialValues}
            formLayout={formLayout}
            onSubmitForm={formSubmit}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto my-10 border rounded-xl shadow-lg">
          <div className="card-body flex flex-col gap-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle
                  text={modelData ? `Edit ${model?.title || ''}` : `New ${model?.title || ''}`}
                />
              </ToolbarHeading>

              {hasRole && (
                <ToolbarActions>
                  <Link to={`/admin/model/${model.slug}/builder`} className="btn btn-sm btn-light">
                    <KeenIcon icon="setting-2" className="!text-base" />
                    Builder
                  </Link>
                </ToolbarActions>
              )}
            </Toolbar>

            <FormLayout
              initValues={initialValues}
              formLayout={formLayout}
              flowLayout={model.config.formLayout ? true : false}
              onSubmitForm={formSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
};

export { Create };
