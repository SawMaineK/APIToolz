import React from 'react';
import { Info } from 'lucide-react';
import { makeIcon } from './PlanRequirement';

interface ProcessStep {
  icon: string;
  name: string;
  type: string;
  isNew?: boolean;
}

interface ProcessCardProps {
  title: string;
  description: string;
  steps: ProcessStep[];
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ title, description, steps }) => {
  return (
    <div className="w-96 bg-white border rounded-xl shadow-sm p-4">
      {/* Process Title */}
      <div className="text-xs text-gray-500 mb-1">Process</div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>

      {/* Steps */}
      <div className="mt-4 space-y-2">
        {steps &&
          steps.slice(0, 5).map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-md border hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {/* Step Icon */}
                <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-gray-500">
                  {step.icon && makeIcon(step.icon)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    {step.name}
                    {step.isNew && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{step.type}</div>
                </div>
              </div>
              <Info size={14} className="text-gray-400" />
            </div>
          ))}
      </div>

      {/* Show more + View Process */}
      <div className="flex justify-between mt-4">
        {steps && steps.length > 5 && (
          <button className="text-xs text-indigo-600 hover:underline">
            Show {steps.length - 5} more
          </button>
        )}
        <button className="text-xs px-3 py-1 rounded-md border hover:bg-gray-50">
          View process
        </button>
      </div>
    </div>
  );
};
