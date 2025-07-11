import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { FieldConfigForm } from './FieldConfigForm';
import { BaseForm } from './base/base-form';
import { BaseFormArray } from './base/form-array';
import { floatingInput, floatingSelect } from './FormFieldPropertiesPanel';
import { BaseFormGroup } from './base/form-group';
import { Checkbox } from '../ui/checkbox';

interface IModalProps {
  open: boolean;
  initValue: BaseForm<string> | BaseFormArray | null;
  onOpenChange: () => void;
  onAdded: (form: BaseForm<string> | BaseFormArray) => void;
}

const toPascalCase = (str: string): string =>
  str
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

const AddFormInputModal = ({ open, initValue, onOpenChange, onAdded }: IModalProps) => {
  const isGroupOrArray = (type: string) => ['FormGroup', 'FormArray'].includes(type);

  const [selectedType, setSelectedType] = useState<string>('');
  const [form, setForm] = useState<BaseForm<string> | BaseFormArray>(new BaseForm());
  const [forms, setForms] = useState<BaseForm<string>[]>([]);
  const [formDraft, setFormDraft] = useState<BaseForm<string> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedType(initValue?.controlType ? toPascalCase(initValue.controlType) : '');
      setForm(initValue || new BaseForm());
      setForms(initValue?.formArray || initValue?.formGroup || []);
      setFormDraft(null);
      setEditingIndex(null);
    } else {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setSelectedType('');
    setForm(new BaseForm());
    setForms([]);
    setFormDraft(null);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!form.controlType) return;
    if (selectedType === 'FormInput') {
      onAdded(new BaseForm({ ...form }));
    } else {
      const groupedForm =
        selectedType === 'FormArray'
          ? new BaseFormArray({
              ...form,
              useTable: (form as BaseFormArray).useTable,
              formArray: forms
            })
          : new BaseFormGroup({ ...form, formGroup: forms });
      onAdded(groupedForm);
    }

    onOpenChange();
  };

  const addOrUpdateChild = () => {
    if (!formDraft?.label || !formDraft?.name) return;

    const updated = [...forms];
    editingIndex !== null ? (updated[editingIndex] = formDraft) : updated.push(formDraft);

    setForms(updated);
    setFormDraft(null);
    setEditingIndex(null);
  };

  const handleRemoveForm = (index: number) => {
    setForms(forms.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setFormDraft(new BaseForm({ ...forms[index] }));
    setEditingIndex(index);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Form Input</DialogTitle>
          <DialogDescription>Configure the field and any nested form</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-5">
            {floatingSelect(
              'selectedType',
              selectedType,
              'Select input type',
              ['FormInput', 'FormGroup', 'FormArray'],
              (val: any) => {
                setSelectedType(val);
                setForm(new BaseForm());
                setForms([]);
              }
            )}

            {selectedType === 'FormInput' && <FieldConfigForm form={form} onChange={setForm} />}

            {isGroupOrArray(selectedType) && (
              <>
                {floatingInput('name', form.name || '', 'Name (e.g, category_id)', (e) =>
                  setForm({ ...form, name: e.target.value })
                )}
                {floatingInput('label', form.label || '', 'Label', (e) =>
                  setForm({ ...form, label: e.target.value })
                )}

                {floatingInput('columns', form.columns || '', 'Columns (e.g., w-full)', (e) =>
                  setForm({ ...form, columns: e.target.value })
                )}

                {selectedType === 'FormArray' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={(form as BaseFormArray).useTable || false}
                      onCheckedChange={(val) => setForm({ ...form, useTable: val === true })}
                    />
                    <span className="form-label">Use table layout</span>
                  </div>
                )}
              </>
            )}

            {isGroupOrArray(selectedType) && (
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


            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={!form.controlType}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {initValue ? `Update Field` : `Add Field`}
              </button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddFormInputModal };
