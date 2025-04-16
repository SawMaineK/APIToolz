import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../useAuthContext';
import { Alert } from '@/components';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup, Validators } from 'react-reactive-form';
import { FormInput } from '@/components/form/base/form-input';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormSubmit } from '@/components/form/base/form-submit';
import { Subject } from 'rxjs';
import { FormLayout } from '@/components/form/FormLayout';
import axios from 'axios';

const initialValues = {
  email: '',
  password: '',
  changepassword: '',
  acceptTerms: false
};

const formLayout: BaseForm<string>[] = [
  new FormInput({
    name: 'name',
    label: 'Name',
    display: 'flex flex-col gap-1',
    placeholder: ' Enter name',
    required: true
  }),
  new FormInput({
    name: 'email',
    label: 'Email',
    display: 'flex flex-col gap-1',
    type: 'email',
    placeholder: 'Enter username',
    validators: [Validators.email],
    required: true
  }),
  new FormInput({
    name: 'password',
    label: 'Password',
    display: 'flex flex-col gap-1',
    type: 'password',
    placeholder: 'Enter password',
    required: true
  }),
  new FormInput({
    name: 'password_confirmation',
    label: 'Confirm Password',
    display: 'flex flex-col gap-1',
    type: 'password',
    placeholder: 'Re-enter password',
    required: true,
    validators: [
      (control: any) =>
        control.value === control.parent?.get('password')?.value
          ? null
          : { password_confirmation: true }
    ]
  }),
  new FormCheckBox({
    name: 'agree',
    label: 'I accept Terms & Conditions',
    display: 'flex flex-col gap-1',
    inputClass: 'checkbox-sm',
    value: 'agree',
    required: true,
    handler: () => {}
  }),
  new FormSubmit({
    label: 'Sign Up',
    display: 'y',
    altClass: 'flex',
    inputClass: 'flex justify-center grow'
  })
];

const Signup = () => {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/apitoolz';
  const [showError, setError] = useState(false);

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
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign up</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Already have an Account ?</span>
            <Link to={'/apitoolz/auth/login'} className="text-2sm link">
              Sign In
            </Link>
          </div>
        </div>

        {showError && <Alert variant="danger">The sign up details are incorrect</Alert>}

        <FormLayout
          initValues={initialValues}
          formLayout={formLayout}
          onSubmitForm={formSubmit}
        ></FormLayout>
      </div>
    </div>
  );
};

export { Signup };
