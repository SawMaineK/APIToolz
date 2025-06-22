import { MiscFaq, MiscHelp } from '@/partials/misc';
import { SummaryWidgetCard } from './SummaryWidgetCard';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { Model } from '../_models';
import { useLanguage } from '@/i18n';
import { useRef } from 'react';
import { Cpu } from 'lucide-react';
import { DropdownChatAI } from '@/partials/dropdowns/chat-ai';
import { isArray } from 'lodash';

interface SummaryWidgetContentProps {
  widgets: any[];
  model: Model;
}

const SummaryWidgetContent = ({ widgets, model }: SummaryWidgetContentProps) => {
  const { isRTL } = useLanguage();

  const itemAIChatRef = useRef<any>(null);

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`${model?.title} Summary`} />
          <ToolbarDescription>{model?.desc || ``}</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Menu>
            <MenuItem
              ref={itemAIChatRef}
              onShow={handleShow}
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'bottom-start' : 'bottom-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isRTL() ? [-170, 10] : [50, -100]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-light">
                <Cpu size={16} />
                AI Assist
              </MenuToggle>

              {DropdownChatAI({ menuTtemRef: itemAIChatRef, slug: model.slug, type: 'summary' })}
            </MenuItem>
          </Menu>
        </ToolbarActions>
      </Toolbar>
      <div className="grid gap-5 lg:gap-7.5 mt-4">
        {isArray(widgets) && widgets.filter((widget: any) => widget.type == 'kpi').length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets
              .filter((widget: any) => widget.type === 'kpi')
              .map((widget: any, i: number) => (
                <SummaryWidgetCard key={i} widget={widget} />
              ))}
          </div>
        )}

        {isArray(widgets) && widgets.filter((widget: any) => widget.type == 'chart').length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {widgets
              .filter((widget: any) => widget.type === 'chart')
              .map((widget: any, i: number) => (
                <SummaryWidgetCard key={i} widget={widget} />
              ))}
          </div>
        )}

        {isArray(widgets) &&
          widgets.filter((widget: any) => widget.type == 'progress').length > 0 && (
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
    </>
  );
};

export { SummaryWidgetContent };
