import React, { useEffect, useState } from 'react';
import { WorkflowStep } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

interface ModelOption {
  id: string;
  name: string;
  title?: string;
  config?: {
    forms?: { field: string }[];
  };
}

type KVPair = { key: string; value: string };

export const ModelActionsEditor: React.FC<{
  selected: WorkflowStep;
  setSelected: (s: WorkflowStep) => void;
}> = ({ selected, setSelected }) => {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);

  const createModel = selected.create_model || null;
  const updateModels = selected.update_models || [];

  // ✅ Ensure create_model exists
  useEffect(() => {
    if (!selected.create_model) {
      setSelected({
        ...selected,
        create_model: { model_type: '', fields: {} }
      });
    }
  }, [selected, setSelected]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({ page: '1', per_page: '100' });
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/model?${queryParams.toString()}`
        );
        setModels(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch models', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const prefixedValue = (modelName: string) => `App\\Models\\${modelName}`;

  const convertObjToPairs = (obj: Record<string, any>): KVPair[] =>
    Object.entries(obj || {}).map(([k, v]) => ({ key: k, value: String(v) }));

  const convertPairsToObj = (pairs: KVPair[]): Record<string, any> =>
    pairs.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);

  const renderKVEditor = (
    pairs: KVPair[],
    onChange: (next: KVPair[]) => void,
    modelName: string
  ) => {
    const model = models.find((m) => prefixedValue(m.name) === modelName);
    const availableKeys = Array.isArray(model?.config?.forms)
      ? model.config.forms
      : [];

    return (
      <div>
        {pairs.map((p, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-1 mb-1 items-center">
            {/* Key dropdown */}
            <select
              className="col-span-5 border rounded px-2 py-1 text-xs"
              value={p.key}
              onChange={(e) => {
                const next = pairs.map((item, i) =>
                  i === idx ? { ...item, key: e.target.value } : item
                );
                onChange(next);
              }}
            >
              <option value="">Select field</option>
              {availableKeys.map((f: any, i: number) => (
                <option key={`${f.field}-${i}`} value={f.field}>
                  {f.field}
                </option>
              ))}
            </select>

            {/* Value input */}
            <input
              className="col-span-6 border rounded px-2 py-1 text-xs"
              placeholder="Value (e.g., {{ borrower_name }})"
              value={p.value}
              onChange={(e) => {
                const next = pairs.map((item, i) =>
                  i === idx ? { ...item, value: e.target.value } : item
                );
                onChange(next);
              }}
            />

            {/* Remove */}
            <button
              type="button"
              onClick={() => {
                const next = pairs.filter((_, i) => i !== idx);
                onChange(next);
              }}
              className="col-span-1 text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange([...pairs, { key: 'new_id', value: '{{  }}' }])}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
        >
          <Plus size={14} /> Add Field
        </button>
      </div>
    );
  };

  return (
    <div className="text-xs">
      <h4 className="font-medium mb-1 text-sm">Model Actions</h4>

      {/* Create Model */}
      {createModel && (
        <div className="border rounded p-3 space-y-3 bg-gray-50">
          <div>
            <label className="block text-xs mb-1">Create Model Type</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={createModel.model_type || ''}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  create_model: { ...createModel, model_type: e.target.value }
                })
              }
            >
              <option value="">Select model</option>
              {loading && <option>Loading...</option>}
              {models.map((m) => {
                const value = prefixedValue(m.name);
                return (
                  <option key={m.id} value={value}>
                    {m.title || m.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1">Fields</label>
            {renderKVEditor(
              convertObjToPairs(createModel.fields || {}),
              (nextPairs) =>
                setSelected({
                  ...selected,
                  create_model: {
                    ...createModel,
                    fields: convertPairsToObj(nextPairs)
                  }
                }),
              createModel.model_type || ''
            )}
          </div>
        </div>
      )}

      {/* Update Models */}
      {updateModels.length > 0 && (
        <div className="border rounded p-3 space-y-3 bg-gray-50 mt-3">
          {updateModels.map((um, idx) => (
            <div key={idx} className="space-y-3 border rounded p-3 bg-white">
              <div>
                <label className="block text-xs mb-1">Update Model Type</label>
                <select
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={um.model_type || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const next = updateModels.map((item, i) =>
                      i === idx ? { ...item, model_type: value } : item
                    );
                    setSelected({ ...selected, update_models: next });
                  }}
                >
                  <option value="">Select model</option>
                  {loading && <option>Loading...</option>}
                  {models.map((m) => {
                    const value = prefixedValue(m.name);
                    return (
                      <option key={m.id} value={value}>
                        {m.title || m.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">Model ID Field</label>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={um.model_id_field || ''}
                  onChange={(e) => {
                    const next = updateModels.map((item, i) =>
                      i === idx ? { ...item, model_id_field: e.target.value } : item
                    );
                    setSelected({ ...selected, update_models: next });
                  }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Fields</label>
                {renderKVEditor(
                  convertObjToPairs(um.fields || {}),
                  (nextPairs) => {
                    const next = updateModels.map((item, i) =>
                      i === idx ? { ...item, fields: convertPairsToObj(nextPairs) } : item
                    );
                    setSelected({ ...selected, update_models: next });
                  },
                  um.model_type || ''
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected({
                    ...selected,
                    update_models: updateModels.filter((_, i) => i !== idx)
                  })
                }
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={14} /> Remove Model
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Update Model */}
      <button
        type="button"
        onClick={() =>
          setSelected({
            ...selected,
            update_models: [
              ...(updateModels || []),
              { model_type: '', model_id_field: '', fields: {} }
            ]
          })
        }
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
      >
        <Plus size={14} /> Add Update Model
      </button>
    </div>
  );
};
