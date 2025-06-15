import { Fragment } from 'react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Container } from '@/components/container';
import { SummaryWidgetContent } from './SummaryWidgetContent';
import { useParams } from 'react-router';
import { Model } from '../_models';

const SummaryWidgetPage = () => {
  const { id } = useParams();
  const [widgets, setWidgets] = useState<any[]>([]);

  const [model, setModel] = useState<Model | null>(null);

  const fetchModel = async (modelId: string | undefined) => {
    if (!modelId) return;
    try {
      const response = await axios.get<Model>(
        `${import.meta.env.VITE_APP_API_URL}/model/${modelId}`
      );
      setModel(response.data);
      fetchSummaryWidgets(modelId);
    } catch (error) {
      console.error('Error fetching model:', error);
      setModel(null); // Optional: reset model on error
    }
  };

  const fetchSummaryWidgets = async (modelId: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/${modelId}/summary`);
      setWidgets(response.data.reports);
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchModel(id);
    }
  }, [id]);

  return (
    <Fragment>
      <Container>{model && <SummaryWidgetContent widgets={widgets} model={model} />}</Container>
    </Fragment>
  );
};

export { SummaryWidgetPage };
