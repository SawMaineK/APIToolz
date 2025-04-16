import { MiscFaq, MiscHelp } from '@/partials/misc';

import { ModelContentProps } from '../_models';
import { Create } from './Create';

const CreateContent = ({ model, onCreated }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Create model={model} onCreated={onCreated} />
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { CreateContent };
