import { Loader2, Table } from 'lucide-react';
import { DataModelItem } from '.';
import { useState } from 'react';

export const DataTable = ({
  model,
  isCreate,
  onCreateModel
}: {
  model: DataModelItem;
  isCreate: boolean;
  onCreateModel?: (table: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="flex items-center gap-2 p-3 rounded-md border bg-white hover:bg-gray-50">
      <div className="bg-green-100 text-green-600 p-2 rounded">
        <Table size={16} />
      </div>
      <span className="text-sm font-medium">{model.table_name}</span>
      {isCreate && (
        <button
          className="ml-auto px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
          onClick={async () => {
            setIsLoading(true);
            try {
              await onCreateModel?.(`php artisan apitoolz:model ${model.table_name}`);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : `Create`}
        </button>
      )}
    </div>
  );
};
