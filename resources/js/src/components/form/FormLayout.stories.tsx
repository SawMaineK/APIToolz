import { Meta, StoryObj } from '@storybook/react';
import { Validators, FormGroup } from 'react-reactive-form';
import { FormInput } from './base/form-input';
import { FormRadio } from './base/form-radio';
import { FormReset } from './base/form-reset';
import { FormSelect } from './base/form-select';
import { FormDate } from './base/form-date';
import { FormSubmit } from './base/form-submit';
import { FormLayout } from './FormLayout';
import { FormRadioGroup } from './base/form-radio-group';
import { FormTextArea } from './base/form-textarea';
import { FormTitle } from './base/form-title';
import { FormSubTitle } from './base/form-sub-title';
import { FormSeparator } from './base/form-separator';
import { FormSwitch } from './base/form-switch';
import { FormFile } from './base/form-file';
import { FormInputMask } from './base/form-input-mask';
import { FormLabel } from './base/form-label';
import { FormCheckBox } from './base/form-checkbox';
import { RadioCustom1 } from './radio-box/RadioCustom1';
import { BaseForm } from './base/base-form';
import { RadioCustom2 } from './radio-box/RadioCustom2';
import { RadioCustom3 } from './radio-box/RadioCustom3';
import { toAbsoluteUrl } from '@/utils';
import { FormComponent } from './base/form-component';
import { Fragment } from 'react';

const meta: Meta<typeof FormLayout> = {
  title: 'Components/Layouts/Form Layout',
  component: FormLayout,
  decorators: [
    (Story) => (
      <Fragment>
        <style>
          {`
            .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10.png')}');
            }
            .dark .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10-dark.png')}');
            }
        `}
        </style>
        <div className="flex items-center justify-center grow bg-center bg-no-repeat page-bg py-16">
          <div className="card max-w-[390px] w-full">
            <div className="card-body flex flex-col gap-5 p-10">{Story()}</div>
          </div>
        </div>
      </Fragment>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof FormLayout>;

export const Login: Story = {
  args: {
    formLayout: [
      new FormComponent({
        component: () => {
          return (
            <div className="flex flex-col gap-5">
              <div className="text-center mb-2.5">
                <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign in</h3>
                <div className="flex items-center justify-center font-medium">
                  <span className="text-2sm text-gray-600 me-1.5">Need an account?</span>
                  <a className="text-2sm link">Sign up</a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <a href="#" className="btn btn-light btn-sm justify-center">
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                    className="size-3.5 shrink-0"
                  />
                  Use Google
                </a>
                <a href="#" className="btn btn-light btn-sm justify-center">
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')}
                    className="size-3.5 shrink-0 dark:hidden"
                  />
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')}
                    className="size-3.5 shrink-0 light:hidden"
                  />
                  Use Apple
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="border-t border-gray-200 w-full"></span>
                <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
                <span className="border-t border-gray-200 w-full"></span>
              </div>
            </div>
          );
        }
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
      new FormCheckBox({
        name: 'remember',
        label: 'Remember me?',
        inputClass: 'checkbox-sm',
        columns: 'md:w-1/2',
        value: 'remember',
        handler: () => {}
      }),
      new FormComponent({
        columns: 'md:w-1/2',
        altClass: 'text-right',
        component: () => {
          return <a className="text-2sm link shrink-0">Forgot Password?</a>;
        }
      }),
      new FormSubmit({
        label: 'Sign In',
        altClass: 'flex',
        inputClass: 'flex justify-center grow'
      })
    ],
    initValues: {},
    onSubmitForm: (values, formGroup, submitted$) => {
      console.log('================Form Submit====================');
      console.log(values);
      console.log(formGroup);
      setTimeout(() => {
        submitted$.next(true);
        formGroup.reset();
        console.log('================End Form Submit====================');
      }, 3000);
    },
    onResetForm: (formGroup) => {
      console.log('================Reset====================');
      console.log(formGroup);
      console.log('================End Reset====================');
    }
  }
};

export const Regisgter: Story = {
  args: {
    formLayout: [
      new FormComponent({
        component: () => {
          return (
            <div className="flex flex-col gap-5">
              <div className="text-center mb-2.5">
                <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign up</h3>
                <div className="flex items-center justify-center font-medium">
                  <span className="text-2sm text-gray-600 me-1.5">Already have an Account ?</span>
                  <a className="text-2sm link">Sign In</a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a href="#" className="btn btn-light btn-sm justify-center">
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                    className="size-3.5 shrink-0"
                  />
                  Use Google
                </a>

                <a href="#" className="btn btn-light btn-sm justify-center">
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')}
                    className="size-3.5 shrink-0 dark:hidden"
                  />
                  <img
                    src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')}
                    className="size-3.5 shrink-0 light:hidden"
                  />
                  Use Apple
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="border-t border-gray-200 w-full"></span>
                <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
                <span className="border-t border-gray-200 w-full"></span>
              </div>
            </div>
          );
        }
      }),
      new FormInput({
        name: 'name',
        label: 'Name',
        required: true,
        display: 'flex flex-col gap-1',
        validators: [Validators.min(3)],
        placeholder: 'Enter name'
      }),
      new FormInput({
        name: 'email',
        label: 'Email',
        display: 'flex flex-col gap-1',
        type: 'email',
        placeholder: 'Enter email',
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
        name: 'term',
        label: 'I accept Terms & Conditions',
        inputClass: 'checkbox-sm'
      }),
      new FormSubmit({
        label: 'Sign Up',
        altClass: 'flex',
        inputClass: 'flex justify-center grow'
      })
    ],
    onSubmitForm: (values: any, formGroup: FormGroup, submited$) => {
      console.log('======================Form Submit==============');
      console.log(values);
      submited$.next(true);
      formGroup.reset();
      console.log('======================End Form Submit==============');
    }
  }
};
