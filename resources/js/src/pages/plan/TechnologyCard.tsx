import React from 'react';
import { Info, Edit3, RefreshCw } from 'lucide-react';
import { makeIcon } from './PlanRequirement';

interface ProcessNodeCardProps {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

export const TechnologyCard: React.FC<ProcessNodeCardProps> = ({
  icon,
  title,
  subtitle,
  description
}) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 text-left">
      {/* Header Row */}
      <div className="flex items-start gap-3">
        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center text-purple-600">
          {icon && makeIcon(icon)}
        </div>
        {/* Title + Subtitle */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <Info size={14} className="text-gray-400" />
          </div>
          <p className="text-left text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-left text-sm text-gray-700 mt-3 line-clamp-3">{description}</p>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
          <Edit3 size={14} /> Edit
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
          <RefreshCw size={14} /> Replace
        </button>
      </div>
    </div>
  );
};
