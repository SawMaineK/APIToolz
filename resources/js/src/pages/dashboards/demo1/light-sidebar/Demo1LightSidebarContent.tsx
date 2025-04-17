import { MiscFaq } from '@/partials/misc/MiscFaq';
import { ChannelStats, EntryCallout } from './blocks';
import { MiscHelp } from '@/partials/misc/MiscHelp';

const Demo1LightSidebarContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
            <ChannelStats />
          </div>
        </div>

        <div className="lg:col-span-2">
          <EntryCallout className="h-full" />
        </div>
      </div>
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { Demo1LightSidebarContent };
