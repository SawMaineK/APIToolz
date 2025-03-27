import { MiscFaq, MiscHelp } from '@/partials/misc';
import { ModelContentProps } from '../_models';
import { Overview } from './configs/Overview';
import { Form } from './configs/Form';

const SettingsContent = ({ data, page }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {page === 'overview' && data && <Overview data={data} />}
      {page === 'form' && data && <Form data={data} />}
      {page === 'help' && <MiscHelp />}
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { SettingsContent };
