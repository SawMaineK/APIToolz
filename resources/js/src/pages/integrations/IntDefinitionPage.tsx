import { Fragment } from 'react';
import { Container } from '@/components/container';
import { useLocation } from 'react-router';
import IntDefinition from './IntDefinition';

const IntDefinitionPage = () => {
  const { state } = useLocation();
  return (
    <Fragment>
      <Container>
        <IntDefinition int={state?.integration} />
      </Container>
    </Fragment>
  );
};

export { IntDefinitionPage };
