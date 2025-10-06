import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { WorkflowStep, WorkflowField, Workflow } from './types';
import { FieldList } from './components/FieldList';
import { ConditionList } from './components/ConditionList';
import { ModelActionsEditor } from './components/ModelActionsEditor';
import { StepInfoEditor } from './components/StepInfoEditor';

export type FieldWithId = WorkflowField & { __id: string };
export type Condition = { when: string; next: string };
export type ConditionWithId = Condition & { id: string };

const tempCondId = () => `cond-${Math.random().toString(36).slice(2, 6)}`;
const tempId = () => `temp_${Math.random().toString(36).slice(2, 6)}`;

// UI-only ID seeding
function seedFields(fields: WorkflowField[]): FieldWithId[] {
  return fields.map((f) => ({ ...f, __id: (f as any).__id || f.name || tempId() }));
}
function cleanFields(fields: FieldWithId[]): WorkflowField[] {
  return fields.map(({ __id, ...rest }) => rest);
}
function seedConditions(conds: Condition[]): ConditionWithId[] {
  return conds.map((c) => ({ ...c, id: (c as any).id || tempCondId() }));
}
function cleanConditions(conds: ConditionWithId[]): Condition[] {
  return conds.map(({ id, ...rest }) => rest);
}

export const Inspector: React.FC<{
  open: boolean;
  onClose: () => void;
  workflow: Workflow;
  selected: WorkflowStep | null;
  setSelected: (s: WorkflowStep | null) => void;
  onSave: (step: WorkflowStep) => void;
}> = ({ open, workflow, onClose, selected, setSelected, onSave }) => {
  useEffect(() => {
    if (!selected) return;

    const fields = Array.isArray(selected.form?.fields) ? selected.form.fields : [];
    const conds = Array.isArray(selected.conditions) ? selected.conditions : [];

    setSelected({
      ...selected,
      form: { fields: seedFields(fields) } as any,
      conditions: seedConditions(conds) as any
    });
  }, [selected?.id]);

  if (!selected) return null;

  const handleSave = (step: WorkflowStep) => {
    const cleanStep: WorkflowStep = {
      ...step,
      form: { fields: cleanFields((step.form?.fields as FieldWithId[]) || []) },
      conditions: cleanConditions((step.conditions as ConditionWithId[]) || [])
    };
    onSave(cleanStep);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className="border-0 p-0 w-[420px] scrollable-y-auto"
        forceMount
        side="right"
        close={false}
      >
        <SheetHeader>
          <SheetTitle>
            <h3 className="text-lg font-semibold p-4 border-b">Step Properties</h3>
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6 text-sm">
          <StepInfoEditor selected={selected} setSelected={setSelected} />
          <FieldList selected={selected} setSelected={setSelected} />
          <ModelActionsEditor selected={selected} setSelected={setSelected} />
          <ConditionList
            selected={selected}
            setSelected={setSelected}
            allSteps={workflow.steps || []}
          />

          <div className="pt-4 border-t flex justify-end">
            <button
              className="px-4 py-2 bg-primary hover:bg-primary text-white rounded text-sm"
              onClick={() => handleSave(selected)}
            >
              Save Step
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
