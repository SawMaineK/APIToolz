import React, { Fragment, useRef } from 'react';
import { Container } from '@/components/container';
import { GeneralAIAssist } from './GeneralAIAssist';

const GeneralAIAssistPage: React.FC = () => {
  const itemAIChatRef = useRef<any>(null);
  return (
    <Fragment>
      <Container>
        <GeneralAIAssist
          menuTtemRef={itemAIChatRef}
          slug="general_configuration"
          type="get-started"
        />
      </Container>
    </Fragment>
  );
};

export { GeneralAIAssistPage };
