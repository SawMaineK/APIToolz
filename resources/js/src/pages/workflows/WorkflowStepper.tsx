import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export interface Step {
  id: string | number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentIndex: number;
}

const WorkflowStepper: React.FC<StepperProps> = ({ steps, currentIndex }) => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (stepRefs.current[currentIndex]) {
      stepRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentIndex]);

  if (steps.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-row items-start justify-start flex-nowrap mb-6 min-w-max">
        {steps.map((step, idx) => {
          const isCompleted = currentIndex > idx;
          const isActive = currentIndex === idx;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[idx] = el)}
              className="flex flex-col items-center relative mr-12 last:mr-0 max-w-[120px] flex-shrink-0"
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'border-blue-500 text-blue-600 font-semibold'
                        : 'border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-sm text-center w-full ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
                title={step.label} // tooltip on hover for full label
              >
                {step.label}
              </span>

              {/* Connector ">" */}
              {!isLast && (
                <div className="absolute top-[10px] left-full ml-2">
                  <ChevronRight
                    className={`w-5 h-5 ${currentIndex > idx ? 'text-green-500' : 'text-gray-300'}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
