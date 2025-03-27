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
    const label = relation ? `${relation.title}` : field.label;
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
        if (field.format_as === 'currency') {
          return `$${parseFloat(value).toFixed(2)}`;
        }
        if (
          field.format_as === 'date' ||
          field.format_as === 'datetime' ||
          field.field.includes('_at')
        ) {
          return value ? new Date(value).toLocaleString() : '-';
        }
        if (relation) {
          return info.row.original[relation.title]?.[relation.display || 'name'] || '-';
        }
        if (typeof value === 'string') {
          return truncateText(value);
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
    if (field.type === 'checkbox') {
      return new FormCheckBox({
        name: field.field,
        label: field.label,
        inputClass: 'checkbox-sm',
        value: field.option?.attribute || field.field,
        required: field.validator.includes('required'),
        handler: () => {}
      });
    } else if (field.type === 'submit') {
      return new FormSubmit({
        label: field.label || 'Submit',
        altClass: 'flex',
        inputClass: 'flex justify-center grow'
      });
    } else {
      return new FormInput({
        name: field.field,
        label: field.label,
        display: modal ? 'flex flex-col gap-1' : '',
        columns: modal ? '' : 'lg:w-[70%]',
        type: field.type || 'text',
        placeholder: field.option?.placeholder || `Enter ${field.label}`,
        required: field.validator.includes('required'),
        validators: field.validator.includes('email') ? [Validators.email] : []
      });
    }
  });
};
