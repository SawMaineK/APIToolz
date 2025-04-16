import { Fragment } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { KeenIcon } from '@/components/keenicons';
import { Link } from 'react-router-dom';
import { UsersContent } from './UsersContent';

const UsersPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Users" />
            <ToolbarDescription>Manage all users</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Link to={'/account/home/get-started'} className="btn btn-sm btn-light">
              <KeenIcon icon="exit-down" className="!text-base" />
              Export
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <UsersContent />
      </Container>
    </Fragment>
  );
};

export { UsersPage };
