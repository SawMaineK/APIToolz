import { FormLayout } from '@/components/form/FormLayout';
import { BaseForm } from '@/components/form/base/base-form';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormGroup } from 'react-reactive-form';
import { FormInput } from '@/components/form/base/form-input';
import { Subject } from 'rxjs';
import { ModelContentProps } from '../../_models';
import { toast } from 'sonner';
import { BaseFormGroup } from '@/components/form/base/form-group';
import { BaseFormArray } from '@/components/form/base/form-array';

const Form = ({ data }: ModelContentProps) => {
  const initialValues = {
    ...data
  };

  const formConfigLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'field',
      label: 'Field',
      display: 'flex flex-col gap-1',
      readonly: true,
      columns: 'w-1/3'
    }),
    new FormInput({
      name: 'data_type',
      label: 'Data Type',
      display: 'flex flex-col gap-1',
      readonly: true,
      columns: 'w-1/4'
    }),
    new FormInput({
      name: 'cast',
      label: 'Cast',
      placeholder: 'Please choose',
      display: 'flex flex-col gap-1',
      columns: 'w-1/4'
    }),
    new FormInput({
      name: 'label',
      label: 'Label',
      placeholder: 'Enter alias',
      display: 'flex flex-col gap-1'
    }),
    new FormInput({
      name: 'type',
      label: 'Type',
      placeholder: 'Enter type',
      display: 'flex flex-col gap-1'
    }),
    new FormInput({
      name: 'length',
      label: 'Length',
      placeholder: 'Enter length',
      display: 'flex flex-col gap-1'
    }),
    new FormCheckBox({
      name: 'search',
      label: 'Searchable',
      display: 'flex flex-col gap-1'
    })
  ];

  const formLayout: BaseForm<string>[] = [
    new BaseFormGroup({
      name: 'config',
      display: 'y',
      formGroup: [
        new BaseFormArray({
          name: 'forms',
          useTable: true,
          formArray: formConfigLayout
        })
      ]
    }),
    new FormSubmit({
      label: 'Save Changes',
      display: 'y'
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
            <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">{`${data.name} Form Settings`}</h3>
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

export { Form };
