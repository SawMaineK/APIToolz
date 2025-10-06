import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2 } from 'lucide-react';
import { WorkflowStep } from '../types';
import { SortableItem } from './SortableItem';
import { ConditionWithId } from '../Inspector';

export const ConditionList: React.FC<{
  selected: WorkflowStep;
  setSelected: (s: WorkflowStep) => void;
  allSteps: WorkflowStep[]; // ✅ make required
}> = ({ selected, setSelected, allSteps }) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const conditions: ConditionWithId[] = Array.isArray(selected.conditions)
    ? (selected.conditions as any)
    : [];

  const fields = Array.isArray(selected.form?.fields) ? selected.form.fields : [];
  const fieldNames = fields.map((f: any) => f.name).filter(Boolean);
  const globalNames = ['status', 'loan_amount', 'review_decision'];

  const updateConditions = (next: ConditionWithId[]) =>
    setSelected({ ...selected, conditions: next });

  const addCondition = () =>
    updateConditions([...conditions, { id: `cond-${Date.now()}`, when: '', next: '' }]);

  const removeCondition = (id: string) => updateConditions(conditions.filter((c) => c.id !== id));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = conditions.findIndex((c) => c.id === active.id);
    const newIndex = conditions.findIndex((c) => c.id === over.id);
    updateConditions(arrayMove(conditions, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium mb-1">Conditions</h4>
        <button
          onClick={addCondition}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={conditions.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {conditions.map((c) => (
            <SortableItem key={c.id} id={c.id}>
              <div className="grid grid-cols-12 items-center gap-2 border rounded p-2 mb-1 bg-gray-50 text-xs">
                {/* When expression with autocomplete (col-span-7) */}
                <input
                  className="col-span-7 border rounded p-1 w-full"
                  placeholder="When (expression)"
                  list="field-suggestions"
                  value={c.when}
                  onChange={(e) =>
                    updateConditions(
                      conditions.map((cond) =>
                        cond.id === c.id ? { ...cond, when: e.target.value } : cond
                      )
                    )
                  }
                />
                <datalist id="field-suggestions">
                  {[...fieldNames, ...globalNames].map((name) => (
                    <option key={name} value={name} />
                  ))}
                  <option value="== 'approve'" />
                  <option value="== 'reject'" />
                  <option value="> 0" />
                  <option value="!= null" />
                </datalist>

                {/* Next Step dropdown (col-span-4) */}
                <select
                  className="col-span-4 border rounded p-1 w-full max-w-[200px] truncate"
                  value={c.next}
                  onChange={(e) =>
                    updateConditions(
                      conditions.map((cond) =>
                        cond.id === c.id ? { ...cond, next: e.target.value } : cond
                      )
                    )
                  }
                >
                  <option value="">Next Step</option>
                  {allSteps.map((s) => (
                    <option key={s.id} value={s.id} className="truncate">
                      {s.id} — {s.label || ''}
                    </option>
                  ))}
                </select>

                {/* Remove button (col-span-1) */}
                <button
                  onClick={() => removeCondition(c.id)}
                  className="col-span-1 text-red-600 hover:text-red-800 flex justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
