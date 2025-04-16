import { MiscFaq, MiscHelp } from '@/partials/misc';
import { ModelContentProps } from '../_models';
import { Overview } from './configs/Overview';
import { Form } from './configs/Form';

const SettingsContent = ({ model, page }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {page === 'overview' && model && <Overview model={model} />}
      {page === 'form' && model && <Form model={model} />}
      {page === 'help' && <MiscHelp />}
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { SettingsContent };
