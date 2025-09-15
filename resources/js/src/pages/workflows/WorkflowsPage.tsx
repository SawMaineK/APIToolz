import { Fragment } from 'react';
import { Container } from '@/components/container';
import Workflows from './Workflows';

const WorkflowsPage = () => {
  return (
    <Fragment>
      <Container>
        <Workflows />
      </Container>
    </Fragment>
  );
};

export { WorkflowsPage };
