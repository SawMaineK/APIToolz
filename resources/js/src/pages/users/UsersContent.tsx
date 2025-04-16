import { MiscFaq, MiscHelp } from '@/partials/misc';
import { Users } from './Users';

const UsersContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Users />

      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { UsersContent };
