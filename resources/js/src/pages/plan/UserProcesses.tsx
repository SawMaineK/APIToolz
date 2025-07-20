import React from 'react';
import { MadePlan } from '.';
import { makeIcon } from './PlanRequirement';
import { Network } from 'lucide-react';

interface MadePlanProps {
  plan?: MadePlan;
}

export const UserProcesses = ({ plan }: MadePlanProps) => {
  return (
    <div className="space-y-6">
      {/* Section Heading */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">User processes</h2>
        <p className="text-gray-600 mt-1 text-sm">
          The processes for solving the business problem. Each process appears as a card next to
          this document.
        </p>
      </div>

      {/* Process List */}
      <div className="space-y-4">
        {plan?.processes &&
          plan?.processes.map((process, index) => (
            <div
              key={index}
              className="flex gap-3 items-start p-3 rounded-md hover:bg-gray-50 transition"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center">
                <Network className="w-5 h-5 text-indigo-600" />
              </div>

              {/* Content */}
              <div>
                <h3 className="font-medium text-gray-900">{process.name}</h3>
                <p className="text-sm text-gray-700 mt-1">{process.description}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
