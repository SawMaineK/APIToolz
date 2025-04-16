import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { ModelsContent } from './ModelsContent';

const ModelsPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={`Models`} />
            <ToolbarDescription>Manage all your API models</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <a href={`/api/documentation`} className="btn btn-sm btn-light">
              Restful API Docs
            </a>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <ModelsContent />
      </Container>
    </Fragment>
  );
};

export { ModelsPage };
