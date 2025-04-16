import { MiscFaq, MiscHelp } from '@/partials/misc';

import { DataTable } from './DataTable';
import { ModelContentProps } from '../_models';

const DataTableContent = ({ model }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <DataTable model={model} />

      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { DataTableContent };
