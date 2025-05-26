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
import { FormLayoutBuilder } from '@/components/form/FormLayoutBuilder';
import { useState } from 'react';
import { unset } from 'lodash';
import { BaseFormArray } from '@/components/form/base/form-array';
import { FormDate } from '@/components/form/base/form-date';
import { FormSelect } from '@/components/form/base/form-select';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormInput } from '@/components/form/base/form-input';
import { BaseFormGroup } from '@/components/form/base/form-group';

const FormBuilder = ({ model, modelData, isModal, onCreated }: ModelContentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/apitoolz';

  const initialValues = {
    ...modelData
  };

  const [formLayout, setFormLayout] = useState<BaseForm<string>[]>(
    model.config.formLayout || [
      ...generateFormLayout(model.config.forms || [], isModal || false),
      new FormSubmit({
        label: `Submit`,
        display: 'flex flex-col gap-1',
        altClass: 'flex',
        inputClass: `flex justify-center ${isModal ? 'grow' : ''}`
      })
    ]
  );

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

  const onSaveFormLayout = async (formLayout: BaseForm<string>[]) => {
    console.log(JSON.stringify(formLayout));
    try {
      model.config.formLayout = formLayout;
      const result = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/model/${model.id}`,
        model
      );
      toast.success('Successfully updated');
    } catch (error: any) {
      console.error('Form submission failed:', error);
    }
  };

  const onResetFormLayout = async () => {
    try {
      unset(model.config, 'formLayout');
      const result = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/model/${model.id}`,
        model
      );
      toast.success('Successfully updated');
      setFormLayout([
        ...generateFormLayout(model.config.forms || [], isModal || false),
        new FormSubmit({
          label: `Submit`,
          display: 'flex flex-col gap-1',
          altClass: 'flex',
          inputClass: `flex justify-center ${isModal ? 'grow' : ''}`
        })
      ]);
    } catch (error: any) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <div className="card w-full">
      <div className="card-body flex flex-col gap-5">
        <FormLayoutBuilder
          title={`Form Builder for ${model.title}`}
          initValues={{}}
          formLayout={formLayout}
          onSaveFormLayout={onSaveFormLayout}
          onResetFormLayout={onResetFormLayout}
          onSubmitForm={formSubmit}
        ></FormLayoutBuilder>
      </div>
    </div>
  );
};

export { FormBuilder };
