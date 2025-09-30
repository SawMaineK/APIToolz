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
import { useLanguage } from '@/i18n';
import { useBranding } from '@/hooks';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { menuItemHasAccess } from '@/components/menu/utils';

const HeaderLogo = () => {
  const { pathname } = useLocation();
  const { isRTL } = useLanguage();
  const { appName, logoSmall, logoDarkSmall } = useBranding();
  const { getMenuConfig } = useMenus();
  const primaryMenu = getMenuConfig('primary');
  const { hasRole } = useRoleAccess();

  // Compute only accessible items from MENU_ROOT
  const accessibleRootItems = useMemo(() => {
    return MENU_ROOT.filter((item) => {
      if (typeof item.childrenIndex !== 'number') {
        return true;
      }
      const menuItem = primaryMenu?.[item.childrenIndex];
      return menuItemHasAccess(menuItem, hasRole);
    });
  }, [primaryMenu, hasRole]);

  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);

  useEffect(() => {
    // Match item based on current path
    const matchedItem = accessibleRootItems.find(
      (item) => item.rootPath && pathname.includes(item.rootPath)
    );

    if (matchedItem) {
      setSelectedMenuItem(matchedItem);
    } else if (selectedMenuItem && !accessibleRootItems.includes(selectedMenuItem)) {
      // Reset if previously selected item is no longer accessible
      setSelectedMenuItem(null);
    }
  }, [pathname, accessibleRootItems, selectedMenuItem]);

  return (
    <div className="flex items-center gap-2 lg:gap-5 2xl:-ml-[60px]">
      <Link to="/" className="shrink-0">
        <img src={logoSmall} className="dark:hidden min-h-[42px]" alt="logo" />
        <img src={logoDarkSmall} className="hidden dark:inline-block min-h-[42px]" alt="logo" />
      </Link>

      <div className="flex items-center">
        <h3 className="text-gray-700 text-base hidden md:block">{appName}</h3>
        <span className="text-sm text-gray-400 font-medium px-2.5 hidden md:inline">/</span>

        <Menu className="menu-default">
          <MenuItem
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              placement: isRTL() ? 'bottom-end' : 'bottom-start',
              modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
            }}
          >
            <MenuToggle className="text-gray-900 font-medium">
              {selectedMenuItem ? selectedMenuItem.title : 'Manage Apps'}
              <MenuArrow>
                <KeenIcon icon="down" />
              </MenuArrow>
            </MenuToggle>
            <MenuSub className="menu-default w-48">
              {accessibleRootItems.map((item, index) => (
                <MenuItem
                  key={index}
                  className={item === selectedMenuItem ? 'active' : ''}
                  onClick={() => setSelectedMenuItem(item)}
                >
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
