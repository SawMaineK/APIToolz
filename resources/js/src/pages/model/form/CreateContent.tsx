import { MiscFaq, MiscHelp } from '@/partials/misc';

import { ModelContentProps } from '../_models';
import { Create } from './Create';

const CreateContent = ({ data }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Create data={data} />
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { CreateContent };
