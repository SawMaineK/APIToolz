import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { BaseForm } from '@/components/form/base/base-form';
import { FormInput } from '@/components/form/base/form-input';
import { FormSelect } from '@/components/form/base/form-select';
import axios from 'axios';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormLayout } from '@/components/form/FormLayout';
import { FormGroup, Validators } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { toast } from 'sonner';
import { FormFile } from '@/components/form/base/form-file';
import { FormSwitch } from '@/components/form/base/form-switch';
import { FormPassword } from '@/components/form/base/form-password';

interface IModalProps {
  open: boolean;
  onOpenChange: () => void;
  onCreated?: () => void;
  data?: any;
}

const CreateUserModal = ({ open, onOpenChange, onCreated }: IModalProps) => {
  const fetchRoles = async () => {
    try {
      return await axios.get(`${import.meta.env.VITE_APP_API_URL}/role`).then((res) => {
        return res.data.data.map((role: any) => ({
          label: role.name,
          value: role.id
        }));
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    }
  };
  const formLayout: BaseForm<string>[] = [
    new FormInput({
      name: 'name',
      label: 'Name',
      placeholder: 'Enter name',
      display: 'flex flex-col gap-1',
      required: true
    }),
    new FormInput({
      name: 'email',
      label: 'Email',
      placeholder: 'Enter email',
      type: 'email',
      display: 'flex flex-col gap-1',
      required: true,
      validators: [Validators.email]
    }),
    new FormPassword({
      name: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      type: 'password',
      required: true,
      display: 'flex flex-col gap-1',
      passwordHash: true,
      validators: [
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]).+$/
        )
      ]
    }),
    new FormInput({
      name: 'phone',
      label: 'Phone',
      placeholder: 'Enter phone number',
      type: 'tel',
      display: 'flex flex-col gap-1',
      validators: [Validators.pattern(/^\d{10}$/)]
    }),
    new FormSelect({
      name: 'gender',
      label: 'Gender',
      placeholder: 'Select gender',
      display: 'flex flex-col gap-1',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
      ]
    }),
    new FormFile({
      name: 'avatar',
      label: 'Avatar',
      display: 'flex flex-col gap-1',
      type: 'file'
    }),
    new FormSelect({
      name: 'roles',
      label: 'Role',
      placeholder: 'Select role',
      display: 'flex flex-col gap-1',
      multiple: true,
      options$: fetchRoles
    }),
    new FormSwitch({
      name: 'is_2fa_enabled',
      label: 'Two-Factor Authentication',
      display: 'flex flex-col gap-1'
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
      const formData = new FormData();
      Object.entries(value).forEach(([key, val]) => {
        if (val instanceof File) {
          formData.append(key, val);
        } else {
          formData.append(key, `${val}`);
        }
      });
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/users`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(`${value.name} created successfully!`);
      onOpenChange();
      onCreated?.();
    } catch (error: any) {
      console.error('Form submission failed:', error);
      // Set error state in the form
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        formGroup.setErrors({ submit: data.message });
        if (data.errors && status === 400) {
          Object.entries(data.errors).forEach(([field, message]) => {
            if (formGroup.get(field)) {
              if (message instanceof Array) {
                message.forEach((msg: any) => {
                  formGroup.get(field)?.setErrors({ serverError: msg });
                });
              } else {
                formGroup.get(field)?.setErrors({ serverError: message });
              }
            }
          });
        }
      } else {
        console.error('Unexpected Error:', error?.message || error);
      }
    } finally {
      submitted$.next(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{`Create User`}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid px-5 py-4">
          <FormLayout formLayout={formLayout} onSubmitForm={formSubmit}></FormLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateUserModal };
