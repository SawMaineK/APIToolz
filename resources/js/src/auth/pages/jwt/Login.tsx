import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { Alert } from '@/components';
import { FormLayout } from '@/components/form/FormLayout';
import { BaseForm } from '@/components/form/base/base-form';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormComponent } from '@/components/form/base/form-component';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormGroup, Validators } from 'react-reactive-form';
import { FormInput } from '@/components/form/base/form-input';
import { Subject } from 'rxjs';

const initialValues = {
  email: '',
  password: '',
  remember: false
};

const Login = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [showError, setError] = useState(false);

  const formLayout: BaseForm<string>[] = [
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
    new FormCheckBox({
      name: 'remember',
      label: 'Remember me?',
      display: 'flex flex-col gap-1',
      inputClass: 'checkbox-sm',
      columns: 'w-1/2',
      value: 'remember',
      handler: () => {}
    }),
    new FormComponent({
      columns: 'w-1/2',
      altClass: 'text-right',
      display: 'flex flex-col gap-1',
      component: () => {
        return (
          <Link to={'/admin/auth/reset-password'} className="text-2sm link shrink-0">
            Forgot Password?
          </Link>
        );
      }
    }),
    new FormSubmit({
      label: 'Sign In',
      display: 'y',
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      if (!login) {
        throw new Error('JWTProvider is required for this form.');
      }

      await login(value.email, value.password);

      if (value.remember) {
        localStorage.setItem('email', value.email);
      } else {
        localStorage.removeItem('email');
      }
      submitted$.next(true);
      navigate(from, { replace: true });
    } catch (error: any) {
      submitted$.next(true);
      console.log(error.message);
      if (error.message.includes('Two-factor authentication is required.')) {
        navigate('/admin/auth/2fa', { state: { from, email: value.email } });
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="flex flex-col gap-5">
          <div className="text-center mb-2.5">
            <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign in</h3>
            <div className="flex items-center justify-center font-medium">
              <span className="text-2sm text-gray-600 me-1.5">Sign in to your account?</span>
              {/* <Link to={'/admin/auth/signup'} className="text-2sm link">
                Sign up
              </Link> */}
            </div>
          </div>
          {showError && <Alert variant="danger">The login details are incorrect</Alert>}
        </div>
        <FormLayout
          initValues={initialValues}
          formLayout={formLayout}
          onSubmitForm={formSubmit}
        ></FormLayout>
      </div>
    </div>
  );
};

export { Login };
