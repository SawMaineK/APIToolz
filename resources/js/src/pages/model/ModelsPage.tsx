import { Fragment } from 'react';

import { Container } from '@/components/container';
import { ModelsContent } from './ModelsContent';

const ModelsPage = () => {
  return (
    <Fragment>
      <Container>
        <ModelsContent />
      </Container>
    </Fragment>
  );
};

export { ModelsPage };
