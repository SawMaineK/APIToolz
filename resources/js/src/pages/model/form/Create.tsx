import { toast } from 'sonner';
import axios from 'axios';
import { ModelContentProps } from '../_models';
import { FormLayout } from '@/components/form/FormLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { Subject } from 'rxjs';
import { generateFormLayout } from '../_helper';

const Create = ({ model, modelData, isModal, onCreated }: ModelContentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/apitoolz';

  const initialValues = {
    ...modelData
  };

  const formLayout: BaseForm<string>[] = [
    ...generateFormLayout(model.config.forms || [], isModal || false),
    new FormSubmit({
      label: `Submit`,
      display: isModal ? 'flex flex-col gap-1' : '',
      altClass: isModal ? 'flex' : '',
      inputClass: isModal ? 'flex justify-center grow' : ''
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const formData = new FormData();
      formLayout.forEach((form) => {
        if (form.name && value[form.name] !== undefined) {
          if (form.type === 'file') {
            if (value[form.name] instanceof File || value[form.name] instanceof Blob) {
              formData.append(form.name, value[form.name]);
            }
          } else if (form.type === 'array') {
            if (Array.isArray(value[form.name])) {
              value[form.name].forEach((item: any) => {
                if (item instanceof File || item instanceof Blob) {
                  formData.append(form.name, item);
                } else {
                  formData.append(form.name, JSON.stringify(item));
                }
              });
            }
          } else {
            formData.append(form.name, `${value[form.name]}`);
          }
        }
      });
      if (modelData) {
        formData.append(model.key, modelData.id);
      }
      const result = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/${model.slug}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: ``
          }
        }
      );
      toast.success('Successfully created');
      submitted$.next(true);
      if (isModal) {
        formGroup.reset();
        onCreated?.(result.data);
      } else {
        navigate(from, { replace: true });
      }
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
    <>
      {isModal ? (
        <div className="">
          <FormLayout
            initValues={initialValues}
            formLayout={formLayout}
            onSubmitForm={formSubmit}
          ></FormLayout>
        </div>
      ) : (
        <div className="card w-full">
          <div className="card-body flex flex-col gap-5 p-10">
            <div className="mb-2.5">
              <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
                {modelData ? `Edit` : `New`} {model.title}
              </h3>
            </div>
            <FormLayout
              initValues={initialValues}
              formLayout={formLayout}
              onSubmitForm={formSubmit}
            ></FormLayout>
          </div>
        </div>
      )}
    </>
  );
};

export { Create };
