import { BaseForm } from '@/components/form/base/base-form';
import axios from 'axios';
import { Validators } from 'react-reactive-form';

export type WorkflowStep = {
  id: string;
  label: string;
  roles: string[];
  form?: {
    fields: BaseForm<string>[];
  };
};

export type WorkflowInstance = {
  id: number;
  workflow_name: string;
  current_step: string;
  data: Record<string, any>;
};

type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'dropdown'
  | 'radio'
  | 'file'
  | 'sub_title';

type ValidatorConfig = {
  rule: string;
  value?: any;
  message?: string;
};

export function createWorkflowField(type: FieldType, options: BaseForm<string>): BaseForm<string> {
  let controlType: string;
  let options$: any;

  switch (type) {
    case 'textarea':
      controlType = 'textarea';
      break;
    case 'select':
    case 'radio':
    case 'dropdown':
      controlType = 'dropdown';
      if (options.options$?.type === 'api') {
        const { endpoint, valueField, labelField } = options.options$.config;
        options$ = async () => {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_APP_API_URL}${endpoint}?fields=${labelField},${valueField}&per_page=1000`
            );
            return res.data.data.map((item: any) => ({
              label: item[labelField || 'name'],
              value: item[valueField || 'id']
            }));
          } catch (e) {
            console.error('Error loading options for', options.name, e);
            return [];
          }
        };
      } else if (options.options$?.type === 'static') {
        options$ = async () => options.options$.config || [];
      } else {
        options$ = async () => options.options || [];
      }
      break;
    case 'checkbox':
      controlType = 'checkbox';
      break;
    case 'date':
      controlType = 'date';
      break;
    case 'datetime':
      controlType = 'datetime';
      break;
    case 'file':
      controlType = 'file';
      break;
    case 'sub_title':
      controlType = 'sub_title';
      break;
    default:
      controlType = 'textbox';
  }

  // Validator factories
  const validatorsMap: Record<string, any> = {
    required: (message?: string) => (control: any) =>
      Validators.required(control)
        ? { required: { message: message || 'This field is required' } }
        : null,

    email: (message?: string) => (control: any) =>
      Validators.email(control)
        ? { email: { message: message || 'This field must be a valid email address.' } }
        : null,

    minLength: (len: number, message?: string) => (control: any) =>
      Validators.minLength(len)(control)
        ? { minLength: { message: message || `Minimum length is ${len}` } }
        : null,

    maxLength: (len: number, message?: string) => (control: any) =>
      Validators.maxLength(len)(control)
        ? { maxLength: { message: message || `Maximum length is ${len}` } }
        : null,
    min: (min: number, message?: string) => (control: any) =>
      Validators.min(min)(control)
        ? { min: { message: message || `Minimum value is ${min}` } }
        : null,
    max: (max: number, message?: string) => (control: any) =>
      Validators.max(max)(control)
        ? { max: { message: message || `Maximum value is ${max}` } }
        : null,
    pattern: (pattern: string, message?: string) => (control: any) =>
      Validators.pattern(pattern)(control)
        ? { pattern: { message: message || `Value does not match the required pattern.` } }
        : null
  };

  function buildValidators(configs: ValidatorConfig[] = []) {
    return configs
      .map((v) => {
        const factory = validatorsMap[v.rule];
        if (!factory) return null;

        if (typeof v.value !== 'undefined') {
          return factory(v.value, v.message);
        }
        return factory(v.message);
      })
      .filter(Boolean);
  }

  return new BaseForm<string>({
    ...options,
    type,
    controlType,
    options$,
    validators: buildValidators(options.validators)
  });
}
