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
      <PageNavbar menuConfig={menuConfig} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={model?.title} />
            {model?.desc && <ToolbarDescription>{model?.desc}</ToolbarDescription>}
          </ToolbarHeading>
          <ToolbarActions>
            <a href="#" className="btn btn-sm btn-light">
              <KeenIcon icon="setting-4 mr-2" />
              {model?.title} Settings
            </a>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>{model && <CreateContent data={model} />}</Container>
    </Fragment>
  );
};

export { CreatePage };
