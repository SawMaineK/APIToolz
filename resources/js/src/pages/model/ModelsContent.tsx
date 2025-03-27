import { MiscFaq, MiscHelp } from '@/partials/misc';
import { Models } from './Models';


const ModelsContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Models/>

      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { ModelsContent };
