import { Fragment } from 'react';
import { Container } from '@/components/container';
import { useParams } from 'react-router';
import { MadePlan } from './MadePlan';

const MadePlanPage = () => {
  const { id } = useParams();
  return (
    <Fragment>
      <MadePlan id={id} />
    </Fragment>
  );
};

export { MadePlanPage };
