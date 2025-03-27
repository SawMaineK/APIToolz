import { FormLayout } from '@/components/form/FormLayout';
import { BaseForm } from '@/components/form/base/base-form';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormGroup } from 'react-reactive-form';
import { FormInput } from '@/components/form/base/form-input';
import { Subject } from 'rxjs';
import { ModelContentProps } from '../../_models';
import { FormTextArea } from '@/components/form/base/form-textarea';
import { toast } from 'sonner';

const Overview = ({ data }: ModelContentProps) => {
  const initialValues = {
    title: data.title,
    desc: data.desc,
    auth: data.auth
  };

  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'title',
      label: 'Title',
      placeholder: 'Enter title',
      hint: 'This will be displayed as the main title.',
      required: true
    }),
    new FormTextArea({
      name: 'desc',
      label: 'Description',
      placeholder: 'Enter description',
      hint: 'Provide a brief overview of the model.',
      defaultLength: 5
    }),
    new FormCheckBox({
      name: 'auth',
      label: 'Requires Authentication',
      hint: 'Check if authentication is required for this model.'
    }),
    new FormSubmit({
      label: 'Save Changes'
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      //   await login(value.email, value.password);
      submitted$.next(true);
      toast.success('Changes saved successfully.');
    } catch (error: any) {
      submitted$.next(true);
      console.log(error.message);
      formGroup.setErrors({ submit: 'Failed to update. Please try again.' });
    }
  };

  return (
    <div className="card w-full">
      <div className="card-body flex flex-col gap-5 p-10">
        <div className="flex flex-col gap-5">
          <div className="mb-2.5">
            <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">{`${data.name} Overview`}</h3>
          </div>
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

export { Overview };
