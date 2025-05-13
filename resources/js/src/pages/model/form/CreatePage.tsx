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

import axios from 'axios';
import { useParams } from 'react-router';
import { Model } from '../_models';
import { KeenIcon } from '@/components/keenicons';
import { CreateContent } from './CreateContent';
import { useMenus } from '@/providers';

const CreatePage = () => {
  const { id } = useParams();
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
      <Container>{model && <CreateContent model={model} />}</Container>
    </Fragment>
  );
};

export { CreatePage };
