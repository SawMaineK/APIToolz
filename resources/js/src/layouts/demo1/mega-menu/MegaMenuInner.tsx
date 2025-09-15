import React, { useEffect, useState } from 'react';
import { useResponsive } from '@/hooks';
import { KeenIcon } from '@/components';
import {
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuTitle,
  MenuArrow,
  Menu,
  MenuSub,
  MenuIcon
} from '@/components/menu';
import { useDemo1Layout } from '../Demo1LayoutProvider';
import { MENU_MEGA } from '@/config';
import { useLanguage } from '@/i18n';
import { MegaMenuSubDropdown } from '@/partials/menu/mega-menu';

const MegaMenuInner: React.FC = () => {
  const desktopMode = useResponsive('up', 'lg');
  const { isRTL } = useLanguage();
  const [disabled, setDisabled] = useState(true);
  const { layout, sidebarMouseLeave, setMegaMenuEnabled } = useDemo1Layout();

  useEffect(() => {
    setDisabled(true);
    const timer = setTimeout(() => {
      setDisabled(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [layout.options.sidebar.collapse, sidebarMouseLeave]);

  useEffect(() => {
    setMegaMenuEnabled(true);
  }, [setMegaMenuEnabled]);

  const buildArrow = () => (
    <MenuArrow className="flex lg:hidden text-gray-400">
      <KeenIcon icon="plus" className="text-2xs menu-item-show:hidden" />
      <KeenIcon icon="minus" className="text-2xs hidden menu-item-show:inline-flex" />
    </MenuArrow>
  );

  const linkClass =
    'menu-link text-sm text-gray-700 font-medium menu-link-hover:text-primary menu-item-active:text-gray-900 menu-item-show:text-primary menu-item-here:text-gray-900';
  const titleClass = 'text-nowrap';

  const build = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.children && item.children.length > 0) {
        return (
          <MenuItem
            key={index}
            toggle={desktopMode ? 'dropdown' : 'accordion'}
            trigger={desktopMode ? 'hover' : 'click'}
            dropdownProps={{
              placement: isRTL() ? 'bottom-end' : 'bottom-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [20, 0] : [-20, 0] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuLink className={linkClass}>
              {/* <MenuIcon>
                <KeenIcon icon={'home'} />
              </MenuIcon> */}
              <MenuTitle className={titleClass}>{item.title}</MenuTitle>
              {buildArrow()}
            </MenuLink>
            <MenuSub className="menu-default py-2.5 lg:w-[225px]">
              {item.children && MegaMenuSubDropdown(item.children)}
            </MenuSub>
          </MenuItem>
        );
      }
      return (
        <MenuItem key={index}>
          <MenuLink path={item.path || '#'} className={linkClass}>
            <MenuTitle className={titleClass}>{item.title}</MenuTitle>
          </MenuLink>
        </MenuItem>
      );
    });
  };

  return (
    <Menu
      multipleExpand
      disabled={disabled}
      highlight
      className="flex-col lg:flex-row gap-5 lg:gap-7.5 p-5 lg:p-0"
    >
      {build(MENU_MEGA)}
    </Menu>
  );
};

export { MegaMenuInner };
