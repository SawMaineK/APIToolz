import { Fragment, useEffect, useRef, useState } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/partials/page_navbar';

import { DataTableContent } from './DataTableContent';
import axios from 'axios';
import { useParams } from 'react-router';
import { Model } from '../_models';
import { KeenIcon } from '@/components/keenicons';
import { Link } from 'react-router-dom';
import { useMenus } from '@/providers';

const DataTablePage = () => {
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('model');
  const { id } = useParams();
  const fetchCalled = useRef(false);
  const [model, setModel] = useState<Model | null>(null);

  const fetchModel = async () => {
    const model = await axios.get<Model>(`${import.meta.env.VITE_APP_API_URL}/model/${id}`);
    setModel(model.data);
  };

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchModel();
    }
  }, []);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={model?.title} />
            <ToolbarDescription>
              {model?.desc || `Manage all your ${model?.slug}`}
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Link to={'/account/home/get-started'} className="btn btn-sm btn-light">
              <KeenIcon icon="exit-down" className="!text-base" />
              Export
            </Link>
            <Link to={`/apitoolz/model/${model?.slug}/settings/overview`} className="btn btn-sm btn-light">
              <KeenIcon icon="setting-4 mr-2" />
              Model Settings
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>{model && <DataTableContent model={model} />}</Container>
    </Fragment>
  );
};

export { DataTablePage };
