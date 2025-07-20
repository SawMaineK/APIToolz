import { Fragment } from 'react';
import { Container } from '@/components/container';
import { TrashUsers } from './TrashUsers';

const TrashUsersPage = () => {
  return (
    <Fragment>
      <Container>
        <TrashUsers />
      </Container>
    </Fragment>
  );
};

export { TrashUsersPage };
