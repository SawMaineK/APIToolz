import { Fragment, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/container';

import axios from 'axios';
import { useParams } from 'react-router';
import { Model } from '../_models';
import { FormBuilderContent } from './FormBuilderContent';

const FormBuilderPage = () => {
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
      <Container>{model && <FormBuilderContent model={model} />}</Container>
    </Fragment>
  );
};

export { FormBuilderPage };
