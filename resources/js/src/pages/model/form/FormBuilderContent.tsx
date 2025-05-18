import { MiscFaq, MiscHelp } from '@/partials/misc';

import { ModelContentProps } from '../_models';
import { FormBuilder } from './FormBuilder';

const FormBuilderContent = ({ model, onCreated }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <FormBuilder model={model} onCreated={onCreated} />
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { FormBuilderContent };
