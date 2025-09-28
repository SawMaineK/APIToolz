import React, { useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BaseForm } from './base/base-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { FieldConfigForm } from './FieldConfigForm';

interface FormFieldPropertiesPanelProps {
  formField?: BaseForm<any> | null;
  onChange: (updatedField: BaseForm<any>) => void;
}

export const FormFieldPropertiesPanel: React.FC<FormFieldPropertiesPanelProps> = ({
  formField,
  onChange
}) => {
  const [forms, setForms] = useState<BaseForm<string>[]>([]);
  const [formDraft, setFormDraft] = useState<BaseForm<string> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const updateField = <K extends keyof BaseForm<any>>(key: K, value: BaseForm<any>[K]) => {
    if (!formField) return;
    onChange({ ...formField, [key]: value } as BaseForm<any>);
  };

  useEffect(() => {
    setForms(formField?.formArray || formField?.formGroup || []);
    setFormDraft(null);
    setEditingIndex(null);
  }, []);

  const startEdit = (index: number) => {
    setFormDraft(new BaseForm({ ...forms[index] }));
    setEditingIndex(index);
  };

  const handleRemoveForm = (index: number) => {
    const updated = forms.filter((_, i) => i !== index);
    setForms(updated);
    if (formField) {
      const key = formField.controlType === 'form_array' ? 'formArray' : 'formGroup';
      onChange({ ...formField, [key]: updated } as BaseForm<any>);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = forms.findIndex((f) => f.name === active.id);
      const newIndex = forms.findIndex((f) => f.name === over.id);
      setForms((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const addOrUpdateChild = () => {
    if (!formDraft?.label || !formDraft?.name) return;

    const updated = [...forms];
    editingIndex !== null ? (updated[editingIndex] = formDraft) : updated.push(formDraft);

    setForms(updated);
    setFormDraft(null);
    setEditingIndex(null);
    if (formField) {
      const key = formField.controlType === 'form_array' ? 'formArray' : 'formGroup';
      onChange({ ...formField, [key]: updated } as BaseForm<any>);
    }
  };

  const SortableItem = ({ form, index }: { form: BaseForm<string>; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: form.name
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="border p-2 rounded bg-white shadow"
      >
        <div className="flex justify-between items-center">
          <div className="cursor-move" {...listeners}>
            <strong>{form.label}</strong> – {form.controlType}
          </div>
          <div className="space-x-2 text-sm">
            <button onClick={() => startEdit(index)} className="text-blue-600">
              Edit
            </button>
            <button onClick={() => handleRemoveForm(index)} className="text-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    formField && (
      <div className="space-y-4 p-4 overflow-auto">
        <h3 className="text-md font-semibold">Basic</h3>
        {floatingInput('label', formField.label, 'Label', (e) =>
          updateField('label', e.target.value)
        )}
        {floatingInput('name', formField.name, 'Name', (e) => updateField('name', e.target.value))}
        {floatingInput('value', formField.value, 'Default value', (e) =>
          updateField('value', e.target.value)
        )}
        {floatingInput('valueFn', formField.valueFn || '', 'Function Value', (e) =>
          updateField('valueFn', e.target.value)
        )}
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
            'linebreak',
            'sub_title',
            'submit',
            'switch',
            'text',
            'title',
            'form_array',
            'form_group'
          ],
          (val: any) => updateField('controlType', val)
        )}

        {floatingSelect(
          'type',
          formField.type,
          'Type',
          ['text', 'number', 'email', 'password', 'date', 'file'],
          (val: any) => updateField('type', val)
        )}
        {floatingSelect(
          'cols',
          String(formField.cols),
          'Column Width',
          ['1', '2', '3', '4'],
          (val: any) => updateField('cols', Number(val) || 1)
        )}
        {(formField.controlType == 'form_array' || formField.controlType == 'form_group') && (
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Child Inputs</h4>
              <button
                onClick={() => {
                  setFormDraft(new BaseForm());
                  setEditingIndex(null);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Child
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={forms.map((f) => f.name)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {forms.map((f, i) => (
                    <SortableItem key={f.name} form={f} index={i} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {formDraft && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <FieldConfigForm form={formDraft} onChange={setFormDraft} />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setFormDraft(null);
                      setEditingIndex(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addOrUpdateChild}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    {editingIndex !== null ? 'Update' : 'Add'} Child
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />
        <h3 className="text-md font-semibold">Password Hash</h3>
        {floatingInput(
          'passwordHash',
          formField.passwordHash ?? '',
          'Password Hash (e.g., abcABC1234)',
          (e) => updateField('passwordHash', e.target.value)
        )}
        {floatingInput('hashLength', formField.hashLength ?? 8, 'Hash Length', (e) =>
          updateField('hashLength', Number(e.target.value) || 8)
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
        {floatingInput('mask', formField.mask ?? '', 'Mask', (e) =>
          updateField('mask', e.target.value)
        )}
        {floatingInput('criteriaValue.key', formField.criteriaValue?.key, 'Criteria key', (e) =>
          updateField('criteriaValue', {
            ...formField.criteriaValue,
            key: e.target.value,
            value: formField.criteriaValue?.value || ''
          })
        )}
        {floatingInput(
          'criteriaValue.value',
          formField.criteriaValue?.value,
          'Criteria value',
          (e) =>
            updateField('criteriaValue', {
              ...formField.criteriaValue,
              value: e.target.value,
              key: formField.criteriaValue?.key ?? ''
            })
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
        {floatingInput('minDate', formField.minDate ?? '', 'Mix Date(e.g, today|Y-m-d)', (e) =>
          updateField('minDate', e.target.value)
        )}
        {floatingInput('maxDate', formField.maxDate ?? '', 'Max Date(e.g, today|Y-m-d)', (e) =>
          updateField('maxDate', e.target.value)
        )}
        {floatingInput('columns', formField.columns ?? '', 'Columns (e.g., w-1/2)', (e) =>
          updateField('columns', e.target.value)
        )}

        <Separator />

        <h3 className="text-md font-semibold">File Input</h3>
        {floatingInput(
          'acceptFiles',
          formField.acceptFiles.join(',') ?? '',
          'Accepted Files (e.g. .pdf,.jpg)',
          (e) => updateField('acceptFiles', e.target.value?.split(','))
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
      </div>
    )
  );
};

export const floatingInput = (
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

export const floatingTextarea = (
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

export const floatingSelect = (
  id: string,
  value: any,
  placeholder: string,
  options: string[],
  onChange: (val: string) => void
) => (
  <div className="relative">
    <Select value={value ?? ''} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => (
          <SelectItem key={index} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <label
      htmlFor={id}
      className="absolute left-2 -top-2.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all"
    >
      {placeholder}
    </label>
  </div>
);
