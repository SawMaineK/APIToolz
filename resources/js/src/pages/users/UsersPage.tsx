import { Fragment } from 'react';
import { Container } from '@/components/container';

import { UsersContent } from './UsersContent';

const UsersPage = () => {
  return (
    <Fragment>
      <Container>
        <UsersContent />
      </Container>
    </Fragment>
  );
};

export { UsersPage };
