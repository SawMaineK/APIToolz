import React from 'react';
import * as LucideIcons from 'lucide-react';
import { MadePlan } from '.';

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, group1) => group1.toUpperCase()) // convert kebab to camel
    .replace(/^(.)/, (_, group1) => group1.toUpperCase()); // capitalize first
}

export function makeIcon(icon: string) {
  const IconName = icon ? toPascalCase(icon) : null;

  // Get icon from Lucide library
  const Icon = IconName && (LucideIcons as any)[IconName];

  // ✅ If not found, fallback to Lightbulb
  if (!Icon) {
    return <LucideIcons.Lightbulb className="w-5 h-5 text-indigo-600" />;
  }

  return <Icon className="w-5 h-5 text-indigo-600" />;
}

interface MadePlanProps {
  plan?: MadePlan;
}

export const PlanRequirement = ({ plan }: MadePlanProps) => {
  return (
    <div className="mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold">{plan?.name}</h1>
      <p className="text-sm text-gray-500 mt-1">
        This plan is AI-generated. Make sure to review and change it to ensure accuracy.{' '}
        <a href="#" className="text-blue-600 underline">
          Learn more.
        </a>
      </p>
      <hr className="my-4" />

      {/* Business problem */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold">Business problem</h2>
        <p className="text-gray-700 text-sm">{plan?.problem || 'No business problem described.'}</p>
      </section>

      {/* Purpose */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold">Purpose of this plan</h2>
        <p className="text-gray-700 text-sm">{plan?.purpose}</p>
      </section>

      {/* User requirements */}
      <section>
        <h2 className="text-lg font-semibold mb-4">User requirements</h2>

        {plan?.requirements.map((req, index) => (
          <div className="flex gap-3 mb-6" key={index}>
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center">
              {makeIcon(req.icon)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{req.role}</h3>
              <p className="text-gray-700 text-sm">{req.description}</p>
              <p className="mt-2 italic font-medium text-gray-900 text-sm">As a user, I need to:</p>
              <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                {req.needs &&
                  req.needs.map((need, needIdx) => (
                    <li key={needIdx} className="text-sm">
                      {need}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
