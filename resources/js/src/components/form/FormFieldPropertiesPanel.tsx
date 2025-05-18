import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BaseForm } from './base/base-form';

interface FormFieldPropertiesPanelProps {
  formField: BaseForm<any>;
  onChange: (updatedField: BaseForm<any>) => void;
}

export const FormFieldPropertiesPanel: React.FC<FormFieldPropertiesPanelProps> = ({
  formField,
  onChange
}) => {
  const updateField = <K extends keyof BaseForm<any>>(key: K, value: BaseForm<any>[K]) => {
    onChange({ ...formField, [key]: value });
  };

  const floatingInput = (
    id: string,
    value: any,
    placeholder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="relative">
      <Input
        id={id}
        className="input input-sm peer placeholder-transparent"
        placeholder=" "
        value={value ?? ''}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-2 -top-2 text-xs text-gray-500 bg-white px-1
                    peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm
                    peer-placeholder-shown:text-gray-400 transition-all"
      >
        {placeholder}
      </label>
    </div>
  );

  const floatingTextarea = (
    id: string,
    value: any,
    placeholder: string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  ) => (
    <div className="relative">
      <Textarea
        id={id}
        className="input input-sm peer placeholder-transparent"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="absolute left-2 -top-2.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all"
      >
        {placeholder}
      </label>
    </div>
  );

  const floatingSelect = (
    id: string,
    value: any,
    placeholder: string,
    options: string[],
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  ) => (
    <div className="relative">
      <select
        id={id}
        className="select input-sm peer placeholder-transparent"
        value={value ?? ''}
        onChange={onChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-2 -top-2.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all"
      >
        {placeholder}
      </label>
    </div>
  );

  return (
    <div className="space-y-4 p-4 max-h-[80vh] overflow-auto">
      <h3 className="text-md font-semibold">Basic</h3>
      {floatingInput('label', formField.label, 'Label', (e) =>
        updateField('label', e.target.value)
      )}
      {floatingInput('name', formField.name, 'Name', (e) => updateField('name', e.target.value))}
      {floatingInput('placeholder', formField.placeholder, 'Placeholder', (e) =>
        updateField('placeholder', e.target.value)
      )}
      {floatingSelect(
        'controlType',
        formField.controlType,
        'Control Type',
        [
          'textbox',
          'textarea',
          'label',
          'checkbox',
          'coder',
          'component',
          'date',
          'datetime',
          'dummy',
          'editor',
          'file',
          'hidden',
          'img',
          'mask',
          'note',
          'radio',
          'reset',
          'dropdown',
          'separator',
          'sub_title',
          'submit',
          'switch',
          'text',
          'title'
        ],
        (e) => updateField('controlType', e.target.value)
      )}

      {floatingSelect(
        'type',
        formField.type,
        'Type',
        ['text', 'number', 'email', 'password', 'date', 'file'],
        (e) => updateField('type', e.target.value)
      )}

      <Separator />

      <h3 className="text-md font-semibold">Validation</h3>
      <div className="flex items-center gap-2">
        <Switch
          checked={!!formField.required}
          onCheckedChange={(checked) => updateField('required', checked)}
        />
        <span className="form-label">Required</span>
      </div>
      {floatingInput('min', formField.min ?? '', 'Min', (e) =>
        updateField('min', Number(e.target.value))
      )}
      {floatingInput('max', formField.max ?? '', 'Max', (e) =>
        updateField('max', Number(e.target.value))
      )}

      <Separator />

      <h3 className="text-md font-semibold">Advanced</h3>
    {floatingInput('tooltip', formField.tooltip, 'Tooltip (e.g., helpful info)', (e) =>
      updateField('tooltip', e.target.value)
    )}
    {floatingInput('hint', formField.hint, 'Hint (e.g., additional guidance)', (e) =>
      updateField('hint', e.target.value)
    )}
    {floatingInput(
      'defaultLength',
      formField.defaultLength,
      'Default Row Length (e.g., for Textarea & Table)',
      (e) => updateField('defaultLength', Number(e.target.value) || 3)
    )}
      <div className="flex items-center gap-2">
        <Switch
          checked={!!formField.readonly}
          onCheckedChange={(checked) => updateField('readonly', checked)}
        />
        <span className="form-label">Read-only</span>
      </div>
      {floatingInput('dateFormat', formField.dateFormat ?? '', 'Date Format', (e) =>
        updateField('dateFormat', e.target.value)
      )}
      {floatingInput('columns', formField.columns ?? '', 'Columns (e.g., col-span-6)', (e) =>
        updateField('columns', e.target.value)
      )}

      <Separator />

      <h3 className="text-md font-semibold">File Input</h3>
      {floatingInput(
        'acceptFiles',
        formField.acceptFiles ?? '',
        'Accepted Files (e.g. .pdf,.jpg)',
        (e) => updateField('acceptFiles', e.target.value)
      )}
      <div className="flex items-center gap-2">
        <Switch
          checked={!!formField.filePreview}
          onCheckedChange={(checked) => updateField('filePreview', checked)}
        />
        <span className="form-label">Enable Preview</span>
      </div>

      <Separator />

      <h3 className="text-md font-semibold">Prefix / Endfix</h3>
      {floatingInput('prefix', formField.prefix ?? '', 'Prefix', (e) =>
        updateField('prefix', e.target.value)
      )}
      {floatingInput('endfix', formField.endfix ?? '', 'Endfix', (e) =>
        updateField('endfix', e.target.value)
      )}
      {floatingTextarea('prefixHtml', formField.prefixHtml ?? '', 'Prefix HTML', (e) =>
        updateField('prefixHtml', e.target.value)
      )}
      {floatingTextarea('endfixHtml', formField.endfixHtml ?? '', 'Endfix HTML', (e) =>
        updateField('endfixHtml', e.target.value)
      )}

      <Separator />

      <h3 className="text-md font-semibold">Options</h3>
      {floatingTextarea('options', formField.options ?? '', 'Options (JSON format)', (e) =>
        updateField('options', JSON.parse(e.target.value))
      )}
    </div>
  );
};
