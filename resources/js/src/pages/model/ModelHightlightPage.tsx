import { Fragment, useEffect, useState } from 'react';

import { Container } from '@/components/container';
import { ModelsContent } from './ModelsContent';
import axios from 'axios';
import { useParams } from 'react-router';
import MarkdownViewer from '@/components/markdown/MarkdownViewer';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { KeenIcon } from '@/components/keenicons';
import { Link } from 'react-router-dom';
import { toLowerCase, ucwords } from './_helper';

const ModelHightlightPage = () => {
  const { id, config } = useParams();
  const [hightlight, setHightlight] = useState<string | null>('');

  const fetchModel = async (slug: string | undefined) => {
    if (!slug) return;
    try {
      const { data } = await axios.get<string>(
        `${import.meta.env.VITE_APP_API_URL}/model/${slug}/ask-request`
      );
      setHightlight(data || '');
    } catch (error) {
      console.error('Error fetching model:', error);
      setHightlight(null);
    }
  };

  useEffect(() => {
    fetchModel(id);
  }, [id]);
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={`${id && ucwords(id)} Model Highlight`} />
          </ToolbarHeading>
        </Toolbar>
        <div className="mt-8">
          <MarkdownViewer content={hightlight || `Please wait...`} />
        </div>
      </Container>
    </Fragment>
  );
};

export { ModelHightlightPage };
