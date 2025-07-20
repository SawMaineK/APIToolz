import React, { Fragment, useEffect, useState } from 'react';
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
import { MegaMenuSubHelp } from '@/partials/menu/mega-menu';
import { useDemo1Layout } from '../Demo1LayoutProvider';
import { MENU_MEGA } from '@/config';
import { useLanguage } from '@/i18n';

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

  const build = (items: TMenuConfig) => {
    return (
      <Fragment>
        <MenuItem key="models">
          <MenuLink path="admin/model" className={linkClass}>
            <MenuTitle className={titleClass}>Models</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem key="models">
          <MenuLink path="admin/model/relationship" className={linkClass}>
            <MenuTitle className={titleClass}>Relationship</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem key="menu-config">
          <MenuLink path="admin/menu-config" className={linkClass}>
            <MenuTitle className={titleClass}>Menu Configuration</MenuTitle>
          </MenuLink>
        </MenuItem>
        {/* Add more items here if needed */}
      </Fragment>
    );
  };

  const linkClass =
    'menu-link text-sm text-gray-700 font-medium menu-link-hover:text-primary menu-item-active:text-gray-900 menu-item-show:text-primary menu-item-here:text-gray-900';
  const titleClass = 'text-nowrap';

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
