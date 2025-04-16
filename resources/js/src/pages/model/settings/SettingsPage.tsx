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
import { useMenus } from '@/providers';
import { SettingsContent } from './SettingsContent';
import { useParams } from 'react-router';
import { Model } from '../_models';
import axios from 'axios';

const SettingsPage = () => {
  const { id, page } = useParams();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('model');
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
            <ToolbarPageTitle text={`${model?.title || ``} Model Settings`} />
            <ToolbarDescription>Manage all model settings</ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>{model && <SettingsContent model={model} page={page} />}</Container>
    </Fragment>
  );
};

export { SettingsPage };
