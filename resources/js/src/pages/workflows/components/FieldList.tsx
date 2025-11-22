import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { WorkflowStep, FieldWithId } from '../types';
import { SortableItem } from './SortableItem';
import { FieldEditor } from './FieldEditor';

const uid = () => `f_${Math.random().toString(36).slice(2, 8)}`;

export const FieldList: React.FC<{
  selected: WorkflowStep;
  setSelected: (s: WorkflowStep) => void;
}> = ({ selected, setSelected }) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [editId, setEditId] = useState<string | null>(null);

  const normalizeField = (f: any): FieldWithId => {
    if (!f) return { __id: uid(), name: '', type: 'text', label: '' };
    const { __id, ...rest } = f;
    return {
      __id: __id || f.name || uid(),
      ...rest,
      name: rest.name ?? f.name ?? '',
      type: rest.type ?? f.type ?? 'text',
      label: rest.label ?? f.label ?? ''
    };
  };

  const fields: FieldWithId[] = Array.isArray(selected.form?.fields)
    ? (selected.form.fields as any[]).map(normalizeField)
    : [];

  const updateFields = (next: FieldWithId[]) =>
    setSelected({ ...selected, form: { fields: next } });

  const addField = () => {
    const newField: FieldWithId = { __id: uid(), name: '', type: 'text', label: '' };
    updateFields([...fields, newField]);
    setEditId(newField.__id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.__id === active.id);
    const newIndex = fields.findIndex((f) => f.__id === over.id);
    updateFields(arrayMove(fields, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium">Form Fields</h4>
        <button
          onClick={addField}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.__id)} strategy={verticalListSortingStrategy}>
          {fields.map((f) => (
            <SortableItem key={f.__id} id={f.__id}>
              <FieldEditor
                field={f}
                isEditing={editId === f.__id}
                onEdit={() => setEditId(f.__id)}
                onCancel={() => setEditId(null)}
                onSave={(updated) => {
                  updateFields(fields.map((fld) => (fld.__id === f.__id ? updated : fld)));
                  setEditId(null);
                }}
                onRemove={() => {
                  updateFields(fields.filter((fld) => fld.__id !== f.__id));
                  if (editId === f.__id) setEditId(null);
                }}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
