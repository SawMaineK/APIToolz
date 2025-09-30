import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  MenuArrow,
  MenuIcon,
  MenuItem,
  MenuLabel,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components/menu';
import { MENU_ROOT } from '@/config';
import { KeenIcon } from '@/components';
import { useLanguage } from '@/i18n';
import { useBranding } from '@/hooks';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { menuItemHasAccess } from '@/components/menu/utils';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { pathname } = useLocation();
  const { isRTL } = useLanguage();
  const { appName, logoSmall, logoDarkSmall } = useBranding();
  const { getMenuConfig } = useMenus();
  const primaryMenu = getMenuConfig('primary');
  const { hasRole } = useRoleAccess();

  const accessibleRootItems = useMemo(() => {
    return MENU_ROOT.filter((item) => {
      if (typeof item.childrenIndex !== 'number') {
        return true;
      }

      const menuItem = primaryMenu?.[item.childrenIndex];

      return menuItemHasAccess(menuItem, hasRole);
    });
  }, [primaryMenu, hasRole]);

  const [selectedMenuItem, setSelectedMenuItem] = useState(() => accessibleRootItems[0] ?? MENU_ROOT[0]);

  const handleInputChange = () => {};

  useEffect(() => {
    const matchedItem = accessibleRootItems.find((item) => item.rootPath && pathname.includes(item.rootPath));

    if (matchedItem) {
      setSelectedMenuItem(matchedItem);
    } else if (!accessibleRootItems.includes(selectedMenuItem)) {
      setSelectedMenuItem(accessibleRootItems[0] ?? selectedMenuItem);
    }
  }, [pathname, accessibleRootItems, selectedMenuItem]);

  return (
    <div ref={ref}>
      <div className="flex items-center gap-2.5 px-3.5 h-[70px]">
        <Link to="/">
          <img src={logoSmall} className="dark:hidden h-[42px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:inline-block h-[42px]" alt="logo" />
        </Link>

        <Menu className="menu-default grow">
          <MenuItem
            className="grow"
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              placement: isRTL() ? 'bottom-end' : 'bottom-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 15] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuLabel className="cursor-pointer text-gray-900 font-medium grow justify-between">
              <span className="text-base font-medium text-gray-900 grow justify-start">{appName}</span>
              <MenuArrow>
                <KeenIcon icon="down" />
              </MenuArrow>
            </MenuLabel>
            <MenuSub className="menu-default w-48 py-2">
              {accessibleRootItems.map((item, index) => (
                <MenuItem key={index} className={item === selectedMenuItem ? 'active' : ''}>
                  <MenuLink path={item.path}>
                    {item.icon && (
                      <MenuIcon>
                        <KeenIcon icon={item.icon} />
                      </MenuIcon>
                    )}
                    <MenuTitle>{item.title}</MenuTitle>
                  </MenuLink>
                </MenuItem>
              ))}
            </MenuSub>
          </MenuItem>
        </Menu>
      </div>

      <div className="pt-2.5 px-3.5 mb-1">
        <div className="input">
          <KeenIcon icon="magnifier" />
          <input
            placeholder="Search"
            type="text"
            onChange={handleInputChange}
            className="min-w-0"
            value=""
          />
          <span className="text-2sm text-gray-700 text-nowrap">cmd + /</span>
        </div>
      </div>
    </div>
  );
});

export { SidebarHeader };
