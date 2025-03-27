import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/partials/page_navbar';
import { ModelsContent } from './ModelsContent';
import { useMenus } from '@/providers';

const ModelsPage = () => {
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');

  return (
    <Fragment>
      <PageNavbar menuConfig={menuConfig} />
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
