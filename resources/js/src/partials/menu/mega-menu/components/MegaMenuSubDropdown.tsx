import { DefaultTooltip, KeenIcon } from '@/components';
import {
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuArrow,
  MenuIcon,
  MenuBadge,
  MenuSeparator
} from '@/components/menu';
import { useResponsive } from '@/hooks';
import { useLanguage } from '@/i18n';
import { toPascalCase } from '@/pages/dashboards/demo1';
import clsx from 'clsx';
import { ReactNode } from 'react';
import * as LucideIcons from 'lucide-react';

const MegaMenuSubDropdown = (items: TMenuConfig) => {
  const desktopMode = useResponsive('up', 'lg');
  const { isRTL } = useLanguage();

  const buildItems = (items: TMenuConfig): ReactNode => {
    return items.map((item, index) => {
      const IconName = item.icon ? toPascalCase(item.icon) : null;
      const Icon = IconName && (LucideIcons as any)[IconName];
      if (item.separator) {
        return <MenuSeparator key={index} />;
      } else if (item.children) {
        return (
          <MenuItem
            key={index}
            toggle={desktopMode ? 'dropdown' : 'accordion'}
            trigger={desktopMode ? 'hover' : 'click'}
            dropdownProps={{
              placement: isRTL() ? 'left-start' : 'right-start'
            }}
          >
            <MenuLink className="grow-0">
              {item.icon && <MenuIcon>{Icon && <Icon className={'h-16 w-16'} />}</MenuIcon>}
              <MenuTitle className={clsx('')}>{item.title}</MenuTitle>
              <MenuArrow>
                <KeenIcon icon="right" className="text-3xs rtl:transform rtl:rotate-180" />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="menu-default" rootClassName="max-w-[175px] lg:max-w-[220px]">
              {buildItems(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else {
        return (
          <MenuItem key={index}>
            <MenuLink path={item.path}>
              {item.icon && (
                <MenuIcon>
                  <KeenIcon icon={item.icon} />
                </MenuIcon>
              )}
              <MenuTitle>{item.title}</MenuTitle>

              {item.disabled && (
                <MenuBadge>
                  <span className="badge badge-xs">Soon</span>
                </MenuBadge>
              )}

              {item.badge && (
                <MenuBadge>
                  <span className="badge badge-primary badge-outline badge-xs">{item.badge}</span>
                </MenuBadge>
              )}

              {item.tooltip && (
                <DefaultTooltip title={item.tooltip.title} placement={item.tooltip.placement}>
                  <KeenIcon icon="information-2" className="text-gray-500 text-md" />
                </DefaultTooltip>
              )}
            </MenuLink>
          </MenuItem>
        );
      }
    });
  };

  return buildItems(items);
};

export { MegaMenuSubDropdown };
