import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { FieldWithId } from '../Inspector';

export const FieldEditor: React.FC<{
  field: FieldWithId;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (f: FieldWithId) => void;
  onRemove: () => void;
}> = ({ field, isEditing, onEdit, onCancel, onSave, onRemove }) => {
  const [draft, setDraft] = useState<FieldWithId>(field);

  const commit = () => onSave(draft);

  if (!isEditing) {
    return (
      <div className="border rounded p-2 mb-1 bg-gray-50 text-xs">
        <div className="flex justify-between">
          <div>
            <strong>{field.label || field.name || 'Untitled'}</strong> ({field.type})
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="text-gray-600 hover:text-blue-700">
              <Pencil size={14} />
            </button>
            <button onClick={onRemove} className="text-red-600 hover:text-red-800">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded p-2 mb-1 bg-white text-xs">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          className="col-span-1 border rounded p-1"
          placeholder="Name"
          value={draft.name || ''}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          className="col-span-1 border rounded p-1"
          placeholder="Label"
          value={draft.label || ''}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <select
          className="col-span-1 border rounded p-1"
          value={draft.type || 'text'}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="textarea">Textarea</option>
          <option value="select">Select</option>
          <option value="file">File</option>
          <option value="checkbox">Checkbox</option>
          <option value="date">Date</option>
          <option value="sub_title">Subtitle</option>
        </select>
        <label className="col-span-1 flex items-center gap-1">
          <input
            type="checkbox"
            checked={!!draft.required}
            onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
          />
          Required
        </label>
      </div>

      {/* Extra fields depending on type */}
      {draft.type === 'select' && (
        <textarea
          className="w-full border rounded p-1 text-xs"
          placeholder="Options (value:label per line)"
          value={
            Array.isArray(draft.options)
              ? draft.options.map((o) => `${o.value}:${o.label}`).join('\n')
              : ''
          }
          onChange={(e) => {
            const options = e.target.value
              .split('\n')
              .map((line) => {
                const [v, l] = line.split(':');
                return { value: v?.trim(), label: (l || v)?.trim() };
              })
              .filter((o) => o.value);
            setDraft({ ...draft, options });
          }}
        />
      )}

      {draft.type === 'file' && (
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <input
            className="border rounded p-1"
            placeholder="Accept (pdf,jpg)"
            value={draft.acceptFiles?.join(',') || ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                acceptFiles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <input
            className="border rounded p-1"
            placeholder="Upload Dir"
            value={draft.uploadDir || ''}
            onChange={(e) => setDraft({ ...draft, uploadDir: e.target.value })}
          />
          <label className="col-span-2 flex items-center gap-1">
            <input
              type="checkbox"
              checked={!!draft.multipleFile}
              onChange={(e) => setDraft({ ...draft, multipleFile: e.target.checked })}
            />
            Allow multiple
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={commit} className="text-green-600 hover:text-green-800">
          <Check size={14} />
        </button>
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-800">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
