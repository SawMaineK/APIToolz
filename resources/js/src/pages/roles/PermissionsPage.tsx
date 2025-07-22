import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Permissions } from './Permissions';

const PermissionsPage = () => {
  return (
    <Fragment>
      <Container>
        <Permissions />
      </Container>
    </Fragment>
  );
};

export { PermissionsPage };
