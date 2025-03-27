import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { ModelContentProps } from '../_models';
import { FormLayout } from '@/components/form/FormLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components';
import { useAuthContext } from '@/auth';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { Subject } from 'rxjs';
import { generateFormLayout } from '../_helper';

const Create = ({ data, modal }: ModelContentProps) => {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/apitoolz';
  const [showError, setError] = useState(false);

  const initialValues = {
    email: '',
    password: '',
    changepassword: '',
    acceptTerms: false
  };

  const formLayout: BaseForm<string>[] = [
    ...generateFormLayout(data.config.forms || [], modal || false),
    new FormSubmit({
      label: `Create ${data.title}`,
      display: modal ? 'flex flex-col gap-1' : '',
      altClass: modal ? 'flex' : '',
      inputClass: modal ? 'flex justify-center grow' : ''
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      if (!register) {
        throw new Error('JWTProvider is required for this form.');
      }

      await register(value.name, value.email, value.password, value.password_confirmation);

      submitted$.next(true);
      navigate(from, { replace: true });
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        console.error(`HTTP ${status} Error:`, data.message || 'Bad Request');
        if (data.error && status === 400) {
          Object.entries(data.error).forEach(([field, message]) => {
            if (formGroup.get(field)) {
              formGroup.get(field)?.setErrors({ serverError: message });
            }
          });
        }
      } else {
        console.error('Unexpected Error:', error?.message || error);
      }
      setError(true);
      submitted$.next(true);
    }
  };

  return (
    <>
      {modal ? (
        <div className="">
          {showError && <Alert variant="danger">The sign up details are incorrect</Alert>}

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
                New {data.title}
              </h3>
            </div>

            {showError && <Alert variant="danger">The sign up details are incorrect</Alert>}

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
