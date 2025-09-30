import { Fragment, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/container';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { Model } from '../_models';
import { CreateContent } from './CreateContent';

const CreatePage = () => {
  const { id } = useParams<{ id: string }>();
  const fetchCalled = useRef(false);
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 👈 add loading state
  const location = useLocation();
  const data = location.state?.modelData || null;

  const fetchModel = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Model>(`${import.meta.env.VITE_APP_API_URL}/model/${id}`);
      setModel(res.data);
    } catch (err) {
      console.error('Error fetching model:', err);
    } finally {
      setLoading(false);
    }
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
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-dashed rounded-full animate-spin"></div>
            <span className="ml-3 text-primary font-medium">Loading model...</span>
          </div>
        )}

        {!loading && model && <CreateContent model={model} modelData={data} />}
      </Container>
    </Fragment>
  );
};

export { CreatePage };
