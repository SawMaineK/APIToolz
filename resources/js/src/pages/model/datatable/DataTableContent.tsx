import { MiscFaq, MiscHelp } from '@/partials/misc';

import { DataTable } from './DataTable';
import { ModelContentProps } from '../_models';

const DataTableContent = ({ data }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <DataTable data={data} />

      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { DataTableContent };
