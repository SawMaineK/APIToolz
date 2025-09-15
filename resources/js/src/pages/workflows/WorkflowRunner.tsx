import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WorkflowStep, WorkflowInstance } from './types';
import WorkflowForm from './WorkflowForm';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import WorkflowStepper from './WorkflowStepper';

interface Props {
  workflowName: string;
  steps?: WorkflowStep[];
}

const WorkflowRunner: React.FC<Props> = ({ workflowName, steps = [] }) => {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start workflow
  useEffect(() => {
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_APP_API_URL}/workflow/${workflowName}/start`)
      .then((res) => {
        setInstance(res.data.instance);
        setCurrentStep(res.data.step);
      })
      .catch(() => {
        setError('Failed to start workflow. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [workflowName]);

  // Submit step
  const handleSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    if (!instance || !currentStep) return;
    setLoading(true);
    setError(null);
    axios
      .post(
        `${import.meta.env.VITE_APP_API_URL}/workflow/${workflowName}/${instance.id}/step/${currentStep.id}`,
        values
      )
      .then((res) => {
        setMessage(res.data.message || null);
        setInstance(res.data.instance);
        setCurrentStep(res.data.next_step || null);
      })
      .catch(() => {
        setError('Error processing step. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  // Auto-advance non-form steps
  useEffect(() => {
    if (currentStep && !currentStep.form) {
      handleSubmit({}, new FormGroup({}), new Subject<boolean>());
    }
  }, [currentStep]);

  const currentIndex = steps.findIndex((s) => s.id === currentStep?.id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <span className="ml-3 text-blue-600 font-medium">Processing...</span>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white border rounded-xl shadow-lg text-center">
        {/* Animated Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-green-600">Workflow Completed</h2>
        <p className="mt-2 text-gray-600">All steps for "{workflowName}" are done successfully.</p>

        <div className="mt-4">
          <button
            onClick={() => {
              setInstance(null);
              setCurrentStep(null);
              setMessage(null);
              setError(null);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Start New {workflowName}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white border rounded-xl shadow-lg">
      {/* Stepper */}
      <WorkflowStepper steps={steps} currentIndex={currentIndex} />

      {/* Messages */}
      {message && (
        <div className="mb-3 p-2 text-sm rounded bg-green-100 text-green-700 border border-green-300">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 p-2 text-sm rounded bg-red-100 text-red-700 border border-red-300">
          {error}
        </div>
      )}

      {/* Current Step */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-bold mb-4">{currentStep.label}</h2>
        {currentStep.form ? (
          <WorkflowForm fields={currentStep.form.fields} onSubmit={handleSubmit} />
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Processing step...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowRunner;
