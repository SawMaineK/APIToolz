import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/container';
import { WorkflowHistory } from './WorkflowHistory';

const WorkflowHistoryPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>();

  if (!instanceId) return <p>Workflow instance ID is missing.</p>;

  return (
    <Fragment>
      <Container>
        <WorkflowHistory workflowInstanceId={instanceId} />
      </Container>
    </Fragment>
  );
};

export default WorkflowHistoryPage;
