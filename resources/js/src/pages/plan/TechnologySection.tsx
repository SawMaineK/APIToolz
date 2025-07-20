import React from 'react';
import { Info, Plus, Workflow } from 'lucide-react';
import { MadePlan } from '.';
import { makeIcon } from './PlanRequirement';

interface TechnologySectionProps {
  plan?: MadePlan;
  onAddTechnology?: () => void;
}

export const TechnologySection: React.FC<TechnologySectionProps> = ({ plan, onAddTechnology }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Technology</h2>
          <p className="text-sm text-gray-600 mt-1">
            The apps, flows, and other objects that will be used to solve the business problem.
          </p>
        </div>
      </div>

      {/* Technology List */}
      <div className="space-y-4 mt-6">
        {plan?.technology &&
          plan?.technology.map((tech, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center">
                {makeIcon(tech.icon)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{tech.component}</span>
                  <Info size={14} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500">{tech.type}</span>
                  {/* {tech.isNew && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )} */}
                </div>
                <p className="text-sm text-gray-600 mt-1">{tech.purpose}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Add Technology Button */}
      <button
        onClick={onAddTechnology}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 mt-6"
      >
        <Plus size={16} /> Add technology
      </button>
    </div>
  );
};
