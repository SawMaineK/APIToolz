import { MiscFaq, MiscHelp } from '@/partials/misc';
import { Roles } from './Roles';

const RolesContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Roles />

      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { RolesContent };
