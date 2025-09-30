import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import WorkflowRunner from './WorkflowRunner';
import { WorkflowStep } from './types';

const WorkflowRunnerPage = () => {
  const { id, instanceId } = useParams<{ id: string; instanceId?: string }>();

  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch workflow definition (for stepper)
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/workflows/${id}/definition`)
      .then((res) => {
        setSteps(res.data.steps || []);
      })
      .catch((err) => {
        console.error('Error fetching workflow definition:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Fragment>
      <Container>
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin"></div>
            <span className="ml-3 text-primary font-medium">Loading workflow...</span>
          </div>
        )}

        {!loading && id && (
          <WorkflowRunner
            workflowName={id}
            steps={steps}
            instanceId={instanceId}
            editMode={!!instanceId}
          />
        )}
      </Container>
    </Fragment>
  );
};

export { WorkflowRunnerPage };
