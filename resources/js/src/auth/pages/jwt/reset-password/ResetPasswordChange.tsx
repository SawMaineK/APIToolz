import { Alert } from '@/components';
import { useAuthContext } from '@/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { BaseForm } from '@/components/form/base/base-form';
import { FormInput } from '@/components/form/base/form-input';
import { FormGroup, Validators } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';
import { Subject } from 'rxjs';

const ResetPasswordChange = () => {
  const { changePassword } = useAuthContext();
  const navigate = useNavigate();
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [getError, setError] = useState<string | undefined>(undefined);

  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'password',
      label: 'New Password',
      display: 'flex flex-col gap-1',
      type: 'password',
      placeholder: 'Enter a new password',
      validators: [Validators.minLength(6)],
      required: true
    }),
    new FormInput({
      name: 'password_confirmation',
      label: 'Confirm Password',
      display: 'flex flex-col gap-1',
      type: 'password',
      placeholder: 'Re-enter a new password',
      validators: [Validators.minLength(6)],
      required: true
    }),
    new FormSubmit({
      label: 'Submit',
      display: 'y',
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  const formSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    const token = new URLSearchParams(window.location.search).get('token');
    const email = new URLSearchParams(window.location.search).get('email');

    if (!token || !email) {
      setHasErrors(true);
      setError('Token and email properties are required');
      submitted$.next(true);
      return;
    }

    try {
      await changePassword(email, token, values.password, values.password_confirmation);
      setHasErrors(false);
      navigate('/apitoolz/auth/reset-password/changed');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setError(error.response.data.message);
      } else {
        setError('Password reset failed. Please try again.');
      }
      setHasErrors(true);
    } finally {
      submitted$.next(true);
    }
  };

  return (
    <div className="card max-w-[370px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
          <span className="text-2sm text-gray-700">Enter your new password</span>
        </div>

        {hasErrors && <Alert variant="danger">{getError}</Alert>}

        <FormLayout formLayout={formLayout} onSubmitForm={formSubmit} />
      </div>
    </div>
  );
};

export { ResetPasswordChange };
