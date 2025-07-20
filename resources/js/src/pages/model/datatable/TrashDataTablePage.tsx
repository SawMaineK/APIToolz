import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { DataTableContent } from './DataTableContent';
import axios from 'axios';
import { useParams } from 'react-router';
import { Model } from '../_models';
import { TrashDataTable } from './TrashDataTable';

const TrashDataTablePage = () => {
  const { id } = useParams();
  const [model, setModel] = useState<Model | null>(null);

  const fetchModel = async (modelId: string | undefined) => {
    if (!modelId) return;
    try {
      const response = await axios.get<Model>(
        `${import.meta.env.VITE_APP_API_URL}/model/${modelId}`
      );
      setModel(response.data);
    } catch (error) {
      console.error('Error fetching model:', error);
      setModel(null); // Optional: reset model on error
    }
  };

  useEffect(() => {
    fetchModel(id);
  }, [id]);

  return (
    <Fragment>
      <Container>{model && <TrashDataTable model={model} />}</Container>
    </Fragment>
  );
};

export { TrashDataTablePage };
