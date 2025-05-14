import { Fragment, useEffect, useState } from 'react';
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

const MegaMenuInner = () => {
  const desktopMode = useResponsive('up', 'lg');
  const { isRTL } = useLanguage();
  const [disabled, setDisabled] = useState(true); // Initially set disabled to true
  const { layout, sidebarMouseLeave, setMegaMenuEnabled } = useDemo1Layout();

  // Change disabled state to false after a certain time (e.g., 5 seconds)
  useEffect(() => {
    setDisabled(true);

    const timer = setTimeout(() => {
      setDisabled(false);
    }, 1000); // 1000 milliseconds

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [layout.options.sidebar.collapse, sidebarMouseLeave]);

  useEffect(() => {
    setMegaMenuEnabled(true);
  });

  const build = (items: TMenuConfig) => {
    const helpItem = items[5];

    const linkClass =
      'menu-link text-sm text-gray-700 font-medium menu-link-hover:text-primary menu-item-active:text-gray-900 menu-item-show:text-primary menu-item-here:text-gray-900';
    const titleClass = 'text-nowrap';

    return (
      <Fragment>
        <MenuItem key="model">
          <MenuLink path={'apitoolz/model'} className={linkClass}>
            <MenuTitle className={titleClass}>Models</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem key="model">
          <MenuLink path={'apitoolz/menu-config'} className={linkClass}>
            <MenuTitle className={titleClass}>Menu Configuration</MenuTitle>
          </MenuLink>
        </MenuItem>
        {/* <MenuItem
          key="settings"
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
            <MenuTitle className={titleClass}>Settings</MenuTitle>
            {buildArrow()}
          </MenuLink>
          <MenuSub className="menu-default py-2.5 lg:w-[225px]">
            <MenuItem key={'menu-config'}>
              <MenuLink path={'apitoolz/menu-config'}>
                <MenuIcon>
                  <KeenIcon icon={'burger-menu'} />
                </MenuIcon>
                <MenuTitle>{`Menu Config`}</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem key={'theme-settings'}>
              <MenuLink path={''}>
                <MenuIcon>
                  <KeenIcon icon={'setting-4'} />
                </MenuIcon>
                <MenuTitle>{`Settings`}</MenuTitle>
              </MenuLink>
            </MenuItem>
          </MenuSub>
        </MenuItem> */}

        {/* <MenuItem
          key="help"
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
            <MenuTitle className={titleClass}>{helpItem.title}</MenuTitle>
            {buildArrow()}
          </MenuLink>
          {MegaMenuSubHelp(items)}
        </MenuItem> */}
      </Fragment>
    );
  };

  const buildArrow = () => {
    return (
      <MenuArrow className="flex lg:hidden text-gray-400">
        <KeenIcon icon="plus" className="text-2xs menu-item-show:hidden" />
        <KeenIcon icon="minus" className="text-2xs hidden menu-item-show:inline-flex" />
      </MenuArrow>
    );
  };

  return (
    <Menu
      multipleExpand={true}
      disabled={disabled}
      highlight={true}
      className="flex-col lg:flex-row gap-5 lg:gap-7.5 p-5 lg:p-0"
    >
      {build(MENU_MEGA)}
    </Menu>
  );
};

export { MegaMenuInner };
