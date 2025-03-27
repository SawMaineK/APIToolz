import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { BaseForm } from '@/components/form/base/base-form';
import { FormInput } from '@/components/form/base/form-input';
import { FormTextArea } from '@/components/form/base/form-textarea';
import { FormRadioGroup } from '@/components/form/base/form-radio-group';
import { FormRadio } from '@/components/form/base/form-radio';
import { FormSelect } from '@/components/form/base/form-select';
import axios from 'axios';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';
import { startsWith } from 'lodash';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { toast } from 'sonner';

interface IModalProps {
  open: boolean;
  onOpenChange: () => void;
}

const fetchTables = (inputValue: string, filter: { key: string; value: string }) => {
  return axios.get(`${import.meta.env.VITE_APP_API_URL}/model/tables`).then((resp) => {
    let results: any[] = resp.data.filter((x: any) => startsWith(x.name, inputValue));
    if (filter) {
      results = results.filter((x) => x[filter.key] == filter.value);
    }
    let tables: any[] | PromiseLike<any[]> = [];
    results.map((data: any) => {
      tables.push({ value: data.name, label: data.name });
    });
    return tables;
  });
};

const CreateModel = ({ open, onOpenChange }: IModalProps) => {
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Model Name',
      display: 'flex flex-col gap-1',
      required: true,
      placeholder: 'Enter a descriptive name for your model',
      hint: 'This name will be used to reference your model in the system.'
    }),
    new FormRadioGroup({
      name: 'build_with',
      value: 'ai',
      required: true,
      childs: [
        new FormRadio({
          label: 'Automatically generate SQL using AI',
          value: 'ai'
        }),
        new FormRadio({
          label: 'Select from existing database tables',
          value: 'table'
        }),
        new FormRadio({
          label: 'Write custom SQL for table creation',
          value: 'sql'
        })
      ],
      hint: 'Choose how you want to define your model: AI-generated, existing table, or custom SQL.'
    }),
    new FormTextArea({
      name: 'instruction',
      defaultLength: 3,
      criteriaValue: { key: 'build_with', value: 'ai' },
      display: 'flex flex-col gap-1',
      label: 'AI Instructions',
      placeholder: 'Describe the fields and structure you want. If left empty, AI will decide.',
      hint: 'Provide field names, data types, or any constraints for AI-based SQL generation.'
    }),
    new FormSelect({
      name: 'table',
      label: 'Select a Table',
      criteriaValue: { key: 'build_with', value: 'table' },
      display: 'flex flex-col gap-1',
      options$: fetchTables,
      required: true,
      placeholder: 'Choose from available tables',
      hint: 'Pick an existing table to work with instead of generating a new one.'
    }),
    new FormTextArea({
      name: 'custom_sql',
      defaultLength: 3,
      criteriaValue: { key: 'build_with', value: 'sql' },
      display: 'flex flex-col gap-1',
      label: 'Custom Table SQL',
      placeholder: 'Write your CREATE TABLE SQL statement here',
      hint: 'Define your table manually using SQL. Ensure it is properly formatted.',
      required: true
    }),
    new FormSubmit({
      label: 'Create Model',
      display: 'y',
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    // Handle form submission
    try {
      console.log('Form submitted:', value);
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/model`, value);
      toast.success(`${value.name} created successfully!`);
    } catch (error) {
      console.error('Form submission failed:', error);

      // Set error state in the form
      formGroup.setErrors({ submit: 'Failed to create model. Please try again.' });
    } finally {
      submitted$.next(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Restful API</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 p-5">
          <FormLayout formLayout={formLayout} onSubmitForm={formSubmit}></FormLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateModel };
