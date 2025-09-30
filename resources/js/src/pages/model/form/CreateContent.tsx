import { MiscFaq, MiscHelp } from '@/partials/misc';

import { ModelContentProps } from '../_models';
import { Create } from './Create';

const CreateContent = ({ model, modelData, onCreated }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Create model={model} modelData={modelData} onCreated={onCreated} />
    </div>
  );
};

export { CreateContent };
