import { MiscFaq } from '@/partials/misc/MiscFaq';
import { MiscHelp } from '@/partials/misc/MiscHelp';
import { SummaryWidgetCard } from '@/pages/model/summary/SummaryWidgetCard';
import { ChannelStats, EntryCallout } from './blocks';
interface SummaryWidgetContentProps {
  widgets: any[];
  showPlaceholder: boolean;
}
const Demo1LightSidebarContent = ({ widgets, showPlaceholder }: SummaryWidgetContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {showPlaceholder && (
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
      )}
      {widgets.filter((widget: any) => widget.type == 'kpi').length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets
            .filter((widget: any) => widget.type === 'kpi')
            .map((widget: any, i: number) => (
              <SummaryWidgetCard key={i} widget={widget} />
            ))}
        </div>
      )}

      {widgets.filter((widget: any) => widget.type == 'chart').length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets
            .filter((widget: any) => widget.type === 'chart')
            .map((widget: any, i: number) => (
              <SummaryWidgetCard key={i} widget={widget} />
            ))}
        </div>
      )}

      {widgets.filter((widget: any) => widget.type == 'progress').length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets
            .filter((widget: any) => widget.type === 'progress')
            .map((widget: any, i: number) => (
              <SummaryWidgetCard key={i} widget={widget} />
            ))}
        </div>
      )}
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { Demo1LightSidebarContent };
