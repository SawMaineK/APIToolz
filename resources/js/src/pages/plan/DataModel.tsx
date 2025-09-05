import React, { useState } from 'react';
import { Loader2, Plus, Share2, Table2 } from 'lucide-react';
import { MadePlan } from '.';
import { Link } from 'react-router-dom';

interface DataModelProps {
  plan?: MadePlan;
  onCreateModel?: (table: string) => void;
}

export const DataModel: React.FC<DataModelProps> = ({ plan, onCreateModel }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data model</h2>
          <p className="text-sm text-gray-600 mt-1">
            The tables that will be used to store and provide information.
          </p>
        </div>
        <Link
          to={'/admin/model/relationship'}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <Share2 size={16} />
          Show details
        </Link>
      </div>

      {/* Table List */}
      <div className="space-y-5 mt-6">
        {plan?.data_models &&
          plan?.data_models.map((table, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                <Table2 className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div>
                    <span className="font-medium text-gray-900">{table.table_name}</span>
                    <p className="text-sm text-gray-600 mt-1">{table.description}</p>
                    <button
                      onClick={async () => {
                        const newModelName = prompt('Enter new model name:');
                        if (newModelName && onCreateModel) {
                          setLoading(true);
                          try {
                            await onCreateModel(`Please add new data model for ${newModelName}`);
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      className="btn btn-sm btn-light mt-2 flex items-center gap-1"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4" /> New Model
                    </button>
                  </div>
                </div>
              </div>
              {plan.raw_model_bash && !table.has.model && !table.has.table && (
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await onCreateModel?.(`php artisan apitoolz:model ${table.table_name}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="ml-2 px-3 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
