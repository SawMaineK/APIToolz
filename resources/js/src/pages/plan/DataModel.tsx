import React from 'react';
import { Share2, Table2 } from 'lucide-react';
import { MadePlan } from '.';
import { Link } from 'react-router-dom';

interface DataModelProps {
  plan?: MadePlan;
}

export const DataModel: React.FC<DataModelProps> = ({ plan }) => {
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
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{table.table_name}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{table.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
