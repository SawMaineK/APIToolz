import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { WorkflowStep, WorkflowInstance } from './types';
import WorkflowForm from './WorkflowForm';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import WorkflowStepper from './WorkflowStepper';
import WorkflowCompleted from './WorkflowCompleted';
import HtmlWithScripts from './HtmlWithScripts';
import { useNavigate } from 'react-router';

interface Props {
  workflowName: string;
  steps?: WorkflowStep[];
  instanceId?: string; // 🔹 pass this if editing an existing instance
  editMode?: boolean; // 🔹 enable edit mode
}

const WorkflowRunner: React.FC<Props> = ({
  workflowName,
  steps = [],
  instanceId,
  editMode = false
}) => {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderedView, setRenderedView] = useState<string | null>(null);
  const navigate = useNavigate();

  /** 🔹 Start OR Load workflow */
  const initWorkflow = useCallback(() => {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (editMode && instanceId) {
      // 🔹 Load existing workflow instance
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/workflows/${workflowName}/instance/${instanceId}`)
        .then((res) => {
          setInstance(res.data.instance);
          setCurrentStep(res.data.next_step);
        })
        .catch(() => {
          setError('Failed to load workflow instance. Please try again.');
        })
        .finally(() => setLoading(false));
    } else {
      // 🔹 Start new workflow
      axios
        .post(`${import.meta.env.VITE_APP_API_URL}/workflows/${workflowName}/start`)
        .then((res) => {
          setInstance(res.data.instance);
          setCurrentStep(res.data.step);
        })
        .catch(() => {
          setError('Failed to start workflow. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [workflowName, instanceId, editMode]);

  useEffect(() => {
    initWorkflow();
  }, [initWorkflow]);

  /** 🔹 Submit step */
  const handleSubmit = async (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    if (!currentStep) return;

    //setLoading(true);
    setError(null);

    // 🔹 Helper to build FormData (supports nested objects + files)
    const appendFormData = (formData: FormData, data: any, parentKey?: string) => {
      if (
        data &&
        typeof data === 'object' &&
        !(data instanceof File) &&
        !(data instanceof FileList)
      ) {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          const formKey = parentKey ? `${parentKey}[${key}]` : key;
          appendFormData(formData, value, formKey);
        });
      } else if (data instanceof FileList) {
        Array.from(data).forEach((file) => formData.append(parentKey!, file));
      } else {
        formData.append(parentKey!, data == null ? '' : data);
      }
    };

    const formData = new FormData();
    appendFormData(formData, values);
    try {
      let res = null;
      if (instance != null) {
        res = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/workflows/${workflowName}/${instance.id}/step/${currentStep.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/workflows/${workflowName}/start/step/${currentStep.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // 🔹 Handle Laravel backend special responses
      if (res.data.type === 'redirect' && res.data.url) {
        // Full page redirect
        window.location.href = res.data.url;
        return;
      }

      if (res.data.type === 'view' && res.data.html) {
        // Instead of forcing innerHTML into #app, keep React in control
        // Save HTML into state and render via `dangerouslySetInnerHTML`
        setRenderedView(res.data.html);
        return;
      }

      if (!editMode) {
        navigate(`/admin/workflow/${workflowName}/${res.data.instance.id}`);
      }

      // 🔹 Default JSON response flow
      setMessage(res.data.message || null);
      setInstance(res.data.instance);
      setCurrentStep(res.data.next_step || null);
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setError(err?.response?.data?.error);
      } else {
        setError(err.message);
      }
    } finally {
      submitted$.next(true);
    }
  };

  /** 🔹 Auto-advance non-form steps */
  useEffect(() => {
    if (currentStep && !currentStep.form) {
      handleSubmit({}, new FormGroup({}), new Subject<boolean>());
    }
  }, [currentStep]);

  const currentIndex = steps
    .filter((step) => step.form != null)
    .findIndex((s) => s.id === currentStep?.id);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin"></div>
        <span className="ml-3 text-primary font-medium">
          {editMode ? 'Loading workflow...' : 'Processing...'}
        </span>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <WorkflowCompleted
        workflowName={workflowName}
        startWorkflow={() => {
          navigate(`/admin/workflow/${workflowName}`);
        }}
      />
    );
  }

  return renderedView ? (
    <HtmlWithScripts renderedView={renderedView} />
  ) : (
    <div className="max-w-2xl mx-auto my-10 p-6 border rounded-xl shadow-lg">
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
          <WorkflowForm
            key={currentStep.id}
            fields={currentStep.form.fields}
            roles={currentStep.roles}
            onSubmit={handleSubmit}
            initialValues={instance?.data || {}}
          />
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Processing step...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowRunner;
