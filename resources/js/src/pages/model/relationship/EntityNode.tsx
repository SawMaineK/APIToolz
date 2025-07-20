import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface EntityNodeProps {
  data: {
    title: string;
    table: string;
    fields: string[];
    allFields?: string[]; // optional, used for tooltip if needed
  };
}

export const EntityNode: React.FC<EntityNodeProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const totalFields = data.allFields ? data.allFields.length : data.fields.length;
  const hiddenCount = totalFields > 5 ? totalFields - 5 : 0;

  // ✅ Show only 5 fields by default
  const displayedFields = expanded
    ? data.allFields || data.fields
    : (data.allFields || data.fields).slice(0, 5);

  return (
    <div className="bg-white border rounded-xl shadow-md w-64 transition-all duration-200">
      {/* ✅ Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#4e5867', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#4e5867', width: 8, height: 8 }}
      />

      {/* ✅ Node Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold text-gray-900">{data.title}</h3>
        <p className="text-xs text-gray-500">{data.table}</p>
      </div>

      {/* ✅ Fields */}
      <div className="p-3 space-y-1">
        {displayedFields.map((field: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span>📄</span>
            <span>{field}</span>
          </div>
        ))}

        {/* ✅ Expand button */}
        {!expanded && hiddenCount > 0 && (
          <button
            className="text-xs text-blue-600 hover:underline mt-1"
            onClick={() => setExpanded(true)}
          >
            +{hiddenCount} more
          </button>
        )}

        {/* ✅ Collapse button */}
        {expanded && totalFields > 5 && (
          <button
            className="text-xs text-gray-500 hover:underline mt-1"
            onClick={() => setExpanded(false)}
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};
