import { Fragment } from 'react';
import * as LucideIcons from 'lucide-react';
import { toAbsoluteUrl } from '@/utils/Assets';

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, group1) => group1.toUpperCase()) // convert kebab to camel
    .replace(/^(.)/, (_, group1) => group1.toUpperCase()); // capitalize first
}

export function makeIcon(icon: string) {
  const IconName = icon ? toPascalCase(icon) : null;

  // Get icon from Lucide library
  const Icon = IconName && (LucideIcons as any)[IconName];

  // ✅ If not found, fallback to Lightbulb
  if (!Icon) {
    return <LucideIcons.Lightbulb className="w-10 h-10 mt-4 ms-5 text-primary" />;
  }

  return <Icon className="w-10 h-10 mt-4 ms-5 text-primary" />;
}

interface IChannelStatsItem {
  logo: string;
  logoDark?: string;
  info: string;
  desc: string;
  path: string;
}
interface IChannelStatsItems extends Array<IChannelStatsItem> {}

const ChannelStats = () => {
  const items: IChannelStatsItems = [
    { logo: 'app-window', info: '...', desc: 'Published Apps', path: '' },
    { logo: 'workflow', info: '...', desc: 'Automated Flows', path: '' },
    { logo: 'database', info: '...', desc: 'Dataverse Tables', path: '' },
    {
      logo: 'users',
      info: '...',
      desc: 'Active Users',
      path: ''
    }
  ];

  const renderItem = (item: IChannelStatsItem, index: number) => {
    return (
      <div
        key={index}
        className="card flex-col justify-between gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg"
      >
        {item.logoDark ? (
          <>
            <img
              src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
              className="dark:hidden w-7 mt-4 ms-5"
              alt=""
            />
            <img
              src={toAbsoluteUrl(`/media/brand-logos/${item.logoDark}`)}
              className="light:hidden w-7 mt-4 ms-5"
              alt=""
            />
          </>
        ) : (
          makeIcon(item.logo)
        )}

        <div className="flex flex-col gap-1 pb-4 px-5">
          <span className="text-3xl font-semibold text-gray-900">{item.info}</span>
          <span className="text-2sm font-normal text-gray-700">{item.desc}</span>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <style>
        {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
      </style>

      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
};

export { ChannelStats, type IChannelStatsItem, type IChannelStatsItems };
