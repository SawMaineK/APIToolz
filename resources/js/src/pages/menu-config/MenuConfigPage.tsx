import React, { Fragment } from 'react';

import { Container } from '@/components/container';
import MenuConfig from './MenuConfig';

const MenuConfigPage: React.FC = () => {
  return (
    <Fragment>
      <Container>
        <MenuConfig />
      </Container>
    </Fragment>
  );
};

export { MenuConfigPage };
