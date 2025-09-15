import { Fragment } from 'react';
import { Container } from '@/components/container';
import WorkflowDefinition from './WorkflowDefinition';
import { useLocation } from 'react-router';

const WorkflowDefinitionPage = () => {
  const { state } = useLocation();
  return (
    <Fragment>
      <Container>
        <WorkflowDefinition workflow={state?.workflow} />
      </Container>
    </Fragment>
  );
};

export { WorkflowDefinitionPage };
