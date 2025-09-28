import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { BaseForm } from '@/components/form/base/base-form';
import { FormInput } from '@/components/form/base/form-input';
import axios from 'axios';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { toast } from 'sonner';
import { handleFormError } from '@/utils/ErrorHandler';
import { FormSelect } from '@/components/form/base/form-select';

interface IModalProps {
  open: boolean;
  onOpenChange: () => void;
  onCreated?: () => void;
  data?: any;
}

const CreateRoleModal = ({ open, onOpenChange, onCreated }: IModalProps) => {
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Name',
      placeholder: 'Enter name',
      display: 'flex flex-col gap-1',
      required: true
    }),
    new FormSelect({
      name: 'guard_name',
      label: 'Guard Name',
      placeholder: 'Choose guard name',
      required: true,
      options$: async () => [
        { label: 'sanctum', value: 'sanctum' },
        { label: 'web', value: 'web' }
      ]
    }),
    new FormSubmit({
      label: 'Submit',
      display: 'y',
      altClass: 'flex',
      inputClass: 'flex justify-center grow'
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/role`, value);
      toast.success(`${value.name} created successfully!`);
      onOpenChange();
      onCreated?.();
    } catch (error: any) {
      handleFormError(error, formGroup);
    } finally {
      submitted$.next(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{`Create Role`}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid px-5 py-5">
          <FormLayout formLayout={formLayout} onSubmitForm={formSubmit}></FormLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateRoleModal };
