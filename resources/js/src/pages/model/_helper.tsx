import { Column, ColumnDef } from '@tanstack/react-table';
import { FormField, GridField, Relationship } from './_models';
import { DataGridRowSelect, DataGridRowSelectAll, DataGridColumnHeader } from '@/components';
import { formatIsoDate } from '@/utils/Date';
import { Input } from '@/components/ui/input';
import { FormCheckBox } from '@/components/form/base/form-checkbox';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormInput } from '@/components/form/base/form-input';
import { Validators } from 'react-reactive-form';
import { BaseForm } from '@/components/form/base/base-form';
import { FormSelect } from '@/components/form/base/form-select';
import axios from 'axios';
import { FormHidden } from '@/components/form/base/form-hidden';
import { FormTextArea } from '@/components/form/base/form-textarea';
import { FormInputEditor } from '@/components/form/base/form-editor';
import { FormRadioGroup } from '@/components/form/base/form-radio-group';
import { FormRadio } from '@/components/form/base/form-radio';
import { FormDate } from '@/components/form/base/form-date';
import { FormDateTime } from '@/components/form/base/form-datetime';
import { FormFile } from '@/components/form/base/form-file';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}
export const ucfirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const ucwords = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase());

export const toLowerCase = (str: string) => str.toLowerCase();

export const toUpperCase = (str: string) => str.toUpperCase();

export const capitalizeSentence = (str: string) => str.split('. ').map(ucfirst).join('. ');

export const kebabCase = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

export const snakeCase = (str: string) => str.toLowerCase().replace(/\s+/g, '_');
const truncateText = (text: string, maxLength = 100) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
export const generateColumns = (
  gridFields: GridField[],
  formFields: FormField[],
  relationships: Relationship[]
): ColumnDef<any>[] => {
  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  gridFields = gridFields.sort((a, b) => a.sortlist - b.sortlist);
  gridFields = gridFields.filter((field) => field.view);
  return gridFields.map((field) => {
    const relation = relationships?.find((rel) => rel.key === field.field);
    const index = relation ? `${relation.title}.${relation?.display || 'name'}` : field.field;
    const label = field.label;
    const type = formFields.find((f) => f.field === field.field)?.type;
    const fileOpt = formFields.find((f) => f.field === field.field)?.file;
    return {
      accessorKey: index,
      header: ({ column }) => {
        if (index == `id`) {
          return <DataGridRowSelectAll />;
        }
        return (
          <DataGridColumnHeader
            title={ucwords(label)}
            filter={field.search ? <ColumnInputFilter column={column} /> : null}
            column={column}
          />
        );
      },
      enableSorting: relation ? false : field.sortable,
      cell: (info) => {
        const value = info.row.original[field.field];
        if (index === 'id') {
          return <DataGridRowSelect row={info.row} />;
        }
        if (type === 'file' && value != null && value.url) {
          return (
            <>
              {fileOpt?.upload_type === 'image' ? (
                <img
                  className="size-16 rounded cursor-pointer"
                  src={`${import.meta.env.VITE_APP_IMG_URL || ''}/img/${value.url}?w=400&h=400&fit=crop`}
                  alt={value.name}
                />
              ) : (
                <a
                  href={`${import.meta.env.VITE_APP_IMG_URL || ''}/${value.url}`}
                  target="_blank"
                  className="text-blue-500"
                >
                  {value.name}
                </a>
              )}
            </>
          );
        }
        if (field.format_as === 'currency') {
          return `$${parseFloat(value).toFixed(2)}`;
        }
        if (
          field.format_as === 'date' ||
          field.format_as === 'datetime' ||
          field.field.includes('_at') ||
          field.field.includes('_date')
        ) {
          return value ? new Date(value).toLocaleString() : '-';
        }
        if (relation) {
          const displayKeys = relation.display.split(',');
          return displayKeys
            .map((key) => {
              return info.row.original[relation.title]?.[key] || '-';
            })
            .join(' ');
        //   return info.row.original[relation.title]?.[relation.display || 'name'] || '-';
        }
        if (typeof value === 'string') {
          return truncateText(value);
        }
        if (typeof value === 'object') {
          return ``;
        }
        if (typeof value === 'boolean') {
          return value ? 'YES' : 'NO';
        }
        return value || '-';
      },
      meta: {
        headerClassName:
          index == `id`
            ? 'w-[60px]'
            : index == 'created_at'
              ? `w-[200px]`
              : `w-[${field.width || 'auto'}] text-${field.align || 'left'}`,
        frozen: field.frozen,
        hidden: field.hidden
      }
    };
  });
};

export function requestOptionData(
  slug: string,
  query?: string,
  display: string = 'name',
  key: string = 'id'
): Promise<any> {
  return axios
    .get(
      `${import.meta.env.VITE_APP_API_URL}/${slug}?${query}&fields=${key},${display}&per_page=1000`
    )
    .then((res) => {
      return res.data.data.map((data: any) => {
        const keys = display.split(',');
        const displayValue = keys.map((key) => data[key] || '').join(' ');
        return { value: data[key], label: displayValue };
      });
    })
    .catch((e) => {});
}

export const generateFormLayout = (forms: FormField[], modal: boolean): BaseForm<string>[] => {
  forms = forms.sort((a, b) => a.sortlist - b.sortlist);
  forms = forms.filter(
    (field) =>
      field.view &&
      field.field !== 'id' &&
      field.field !== 'created_at' &&
      field.field !== 'updated_at'
  );
  return forms.map((field) => {
    switch (field.type) {
      case 'hidden':
        return new FormHidden({
          name: field.field,
          label: field.label,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'password':
        return new FormInput({
          name: field.field,
          label: field.label,
          type: 'password',
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'text_email':
        return new FormInput({
          name: field.field,
          label: field.label,
          type: 'email',
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'text_number':
        return new FormInput({
          name: field.field,
          label: field.label,
          type: 'number',
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      //case 'text_tags':
      case 'textarea':
        return new FormTextArea({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          defaultLength: 3,
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'textarea_editor':
        return new FormInputEditor({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'checkbox':
        return new FormCheckBox({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          handler: () => {},
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'radio': {
        const lookupRadio = field.option.lookup_query.split('|').map((x: any) => {
          const dataList = x.split(':');
          return { id: dataList[0], name: dataList[1] };
        });
        return new FormRadioGroup({
          name: field.field,
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {}),
          childs: [
            ...lookupRadio.map((x: any) => {
              return new FormRadio({
                label: x.name,
                value: x.id,
                columns: 'flex items-center space-x-2'
              });
            })
          ]
        });
      }
      case 'date':
      case 'text_date':
        return new FormDate({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          handler: () => {},
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'datetime':
      case 'text_datetime':
        return new FormDateTime({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          handler: () => {},
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'file':
        return new FormFile({
          name: field.field,
          label: field.label,
          type: 'file',
          columns: 'w-full md:w-2/3',
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          multiple: field?.file?.image_multiple,
          //   filePreview: field?.file?.upload_type == 'image' ? true : false,
          handler: () => {},
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
      case 'select':
        return createFormSelectField(field);

      default:
        return new FormInput({
          name: field.field,
          label: field.label,
          columns: 'w-full md:w-2/3',
          placeholder: field.option?.placeholder || `Enter ${field.label}`,
          required: field?.validator && field?.validator?.indexOf('required') != -1 ? true : false,
          validators:
            field?.validator && field?.validator?.indexOf('email') != -1 ? [Validators.email] : [],
          ...(field.criteria
            ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
            : {})
        });
    }
  });
};

export const toFormLayout = (
  formLayout: BaseForm<string>[],
  forms: FormField[]
): BaseForm<string>[] => {
  return formLayout.map((formField: BaseForm<string>) => {
    switch (formField.controlType) {
      case 'form_array':
        formField.formArray = formField.formArray.map((form: BaseForm<string>) => {
          if (form.controlType == 'dropdown') {
            if (form.config.opt_type) {
              const field: FormField = forms[0];
              field.option = form.config;
              field.option.opt_type = form.config.opt_type == 'async' ? 'external' : 'datalist';
              return {
                ...createFormSelectField(field),
                ...form
              };
            }
          }
          return form;
        });
        return formField;
      case 'dropdown':
        {
          const field = forms.find((f: FormField) => f.field === formField.name);
          if (field) {
            if (formField.config.opt_type) {
              field.option = formField.config;
            }
            return {
              ...createFormSelectField(field),
              ...formField
            };
          }
        }
        return formField;
      default:
        return formField;
    }
  });
};

type Filter = { key: string; value: string };

function createFormSelectField(field: any): FormSelect {
  const isRequired = field?.validator?.includes('required') ?? false;

  const commonProps = {
    name: field.field,
    label: field.label,
    multiple: field.option.select_multiple,
    columns: 'w-full md:w-2/3',
    required: isRequired,
    ...(field.criteria
      ? { criteriaValue: { key: field.criteria.key, value: field.criteria.value } }
      : {})
  };

  if (field.option.opt_type === 'external' || field.option.opt_type === 'async') {
    const loadData = async (inputValue: string, filter: Filter) => {
      const lookupValues = field.option.lookup_value.split(',');
      if (filter?.key && filter?.value) {
        const filterQuery = inputValue
          ? `filter=${lookupValues[0]}:like:${inputValue}|${filter.key}:${filter.value}`
          : `filter=${filter.key}:${filter.value}`;
        return requestOptionData(
          toLowerCase(field.option.lookup_model),
          filterQuery,
          field.option.lookup_value,
          field.option.lookup_key
        );
      } else {
        return requestOptionData(
          toLowerCase(field.option.lookup_model),
          `search=${inputValue}`,
          field.option.lookup_value,
          field.option.lookup_key
        );
      }
    };

    return new FormSelect({
      ...commonProps,
      filter:
        field.option.is_dependency || field.option.lookup_dependency_key
          ? {
              parent: field.option.lookup_dependency_key,
              key: field.option.lookup_filter_key || field.option.lookup_dependency_key
            }
          : null,
      options$: loadData
    });
  } else {
    const lookupData = field.option.lookup_query?.split('|').map((x: string) => {
      const [value, label] = x.split(':');
      return { value, label };
    });

    return new FormSelect({
      ...commonProps,
      options$: async () => lookupData
    });
  }
}

export const objectToFormData = (
  obj: any,
  form: FormData = new FormData(),
  namespace = ''
): FormData => {
  for (let key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (!obj.hasOwnProperty(key)) continue;

    const formKey = namespace ? `${namespace}[${key}]` : key;
    const value = obj[key];

    if (value instanceof Date) {
      form.append(formKey, value.toISOString());
    } else if (value instanceof File || value instanceof Blob) {
      form.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((element, index) => {
        const arrayKey = `${formKey}[${index}]`;
        if (typeof element === 'object' && element !== null) {
          objectToFormData(element, form, arrayKey);
        } else {
          form.append(arrayKey, element);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      objectToFormData(value, form, formKey);
    } else if (value !== undefined && value !== null) {
      form.append(formKey, value);
    }
  }

  return form;
};
