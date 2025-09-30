import { Link, useLocation } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import {
  Menu,
  MenuArrow,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle
} from '@/components/menu';
import { MENU_ROOT } from '@/config';
import { useEffect, useMemo, useState } from 'react';
import { useDemo3Layout } from '..';
import { useLanguage } from '@/i18n';
import { useBranding } from '@/hooks';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { menuItemHasAccess } from '@/components/menu/utils';

const HeaderLogo = () => {
  const { pathname } = useLocation();
  const { setMobileSidebarOpen } = useDemo3Layout();
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

  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  useEffect(() => {
    const matchedItem = accessibleRootItems.find((item) => item.rootPath && pathname.includes(item.rootPath));

    if (matchedItem) {
      setSelectedMenuItem(matchedItem);
    } else if (!accessibleRootItems.includes(selectedMenuItem)) {
      setSelectedMenuItem(accessibleRootItems[0] ?? selectedMenuItem);
    }
  }, [pathname, accessibleRootItems, selectedMenuItem]);

  return (
    <div className="flex items-center mr-1">
      <div className="flex items-center justify-center lg:w-[--tw-sidebar-width] gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSidebarOpen}
          className="btn btn-icon btn-light btn-clear btn-sm -ms-2 lg:hidden"
        >
          <KeenIcon icon="menu" />
        </button>

        <Link to="/" className="mx-1">
          <img src={logoSmall} className="dark:hidden min-h-[24px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:inline-block min-h-[24px]" alt="logo" />
        </Link>
      </div>
      <div className="flex items-center">
        <h3 className="text-gray-700 text-base hidden md:block">{appName}</h3>
        <span className="text-sm text-gray-400 font-medium px-2.5 hidden md:inline">/</span>

        <Menu className="menu-default">
          <MenuItem
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              placement: isRTL() ? 'bottom-end' : 'bottom-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 10] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuToggle className="text-gray-900 font-medium">
              {selectedMenuItem.title}
              <MenuArrow>
                <KeenIcon icon="down" />
              </MenuArrow>
            </MenuToggle>
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
    </div>
  );
};

export { HeaderLogo };
