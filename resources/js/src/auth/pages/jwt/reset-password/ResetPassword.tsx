import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Subject } from 'rxjs';
import { useAuthContext } from '@/auth/useAuthContext';
import { Alert, KeenIcon } from '@/components';
import { AxiosError } from 'axios';
import { BaseForm } from '@/components/form/base/base-form';
import { FormInput } from '@/components/form/base/form-input';
import { FormGroup, Validators } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';

const initialValues = {
  email: ''
};

const formLayout: BaseForm<string>[] = [
  new FormInput({
    name: 'email',
    label: 'Email',
    display: 'flex flex-col gap-1',
    type: 'email',
    placeholder: 'Enter email',
    validators: [Validators.email],
    required: true
  }),
  new FormSubmit({
    label: 'Continue',
    display: 'y',
    altClass: 'flex',
    inputClass: 'flex justify-center grow'
  })
];

const ResetPassword = () => {
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [getErrors, setErrors] = useState<string | undefined>(undefined);
  const { requestPasswordResetLink } = useAuthContext();
  const navigate = useNavigate();

  const formSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      if (!requestPasswordResetLink) {
        throw new Error('JWTProvider is required for this form.');
      }
      await requestPasswordResetLink(values.email);
      submitted$.next(true);
      const params = new URLSearchParams();
      params.append('email', values.email);
      navigate({
        pathname: '/admin/auth/reset-password/check-email',
        search: params.toString()
      });
    } catch (error) {
      setHasErrors(true);
      if (error instanceof AxiosError && error.response) {
        setErrors(error.response.data.message);
      } else {
        setErrors('Password reset failed. Please try again.');
      }
      submitted$.next(true);
    }
  };
  return (
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Your Email</h3>
          <span className="text-2sm text-gray-600 font-medium">
            Enter your email to reset password
          </span>
        </div>

        {hasErrors && <Alert variant="danger">{getErrors}</Alert>}

        {hasErrors === false && (
          <Alert variant="success">
            Password reset link sent. Please check your email to proceed
          </Alert>
        )}

        <FormLayout initValues={initialValues} formLayout={formLayout} onSubmitForm={formSubmit} />

        <div className="flex flex-col gap-5 items-stretch">
          <Link
            to={'/admin/auth/login'}
            className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
          >
            <KeenIcon icon="black-left" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ResetPassword };
