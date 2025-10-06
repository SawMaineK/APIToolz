import React from 'react';
import { WorkflowStep } from '../types';

export const StepInfoEditor: React.FC<{
  selected: WorkflowStep;
  setSelected: (s: WorkflowStep) => void;
}> = ({ selected, setSelected }) => {
  return (
    <div>
      <h4 className="font-medium mb-2">General Info</h4>

      {/* Step ID (readonly) */}
      <label className="block text-xs mb-1">Step ID</label>
      <input
        className="w-full rounded border border-gray-200 bg-gray-100 p-1 mb-3 text-sm font-mono text-gray-600"
        value={selected.id || ''}
        readOnly
      />

      {/* Step Label */}
      <label className="block text-xs mb-1">Label</label>
      <input
        className="w-full rounded border border-gray-300 p-1 mb-3 text-sm"
        value={selected.label || ''}
        onChange={(e) => setSelected({ ...selected, label: e.target.value })}
      />

      {/* Roles */}
      <label className="block text-xs mb-1">Roles (comma separated)</label>
      <input
        className="w-full rounded border border-gray-300 p-1 mb-3 text-sm"
        value={selected.roles?.join(', ') || ''}
        onChange={(e) =>
          setSelected({
            ...selected,
            roles: e.target.value.split(',').map((r) => r.trim()),
          })
        }
      />

      {/* Finished toggle */}
      <label className="flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          checked={!!selected.finished}
          onChange={(e) => setSelected({ ...selected, finished: e.target.checked })}
        />
        Finished Step
      </label>
    </div>
  );
};
