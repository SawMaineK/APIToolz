import { Link, useLocation } from 'react-router-dom';
import { KeenIcon, Menu, MenuItem, MenuToggle, DefaultTooltip, MenuIcon } from '@/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getHeight, toAbsoluteUrl } from '@/utils';
import { useBranding, useViewport } from '@/hooks';
import { DropdownUser } from '@/partials/dropdowns/user';
import { DropdownChat } from '@/partials/dropdowns/chat';
import { DropdownApps } from '@/partials/dropdowns/apps';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { filterMenuConfigByRoles } from '@/components/menu/utils';
import { IMenuItemConfig, TMenuConfig } from '@/components/menu';

interface SidebarNavItem {
  icon: string;
  tooltip: string;
  path: string;
  rootPath?: string;
}

const FALLBACK_ITEMS: SidebarNavItem[] = [
  { icon: 'chart-line-star', tooltip: 'Dashboard', path: '/', rootPath: '/' },
  {
    icon: 'profile-circle',
    tooltip: 'Profile',
    path: '/public-profile/profiles/default',
    rootPath: '/public-profile/'
  },
  {
    icon: 'setting-2',
    tooltip: 'Account',
    path: '/account/home/get-started',
    rootPath: '/account/'
  },
  { icon: 'users', tooltip: 'Network', path: '/network/get-started', rootPath: '/network/' },
  {
    icon: 'security-user',
    tooltip: 'Authentication',
    path: '/authentication/get-started',
    rootPath: '/authentication/'
  },
  { icon: 'code', tooltip: 'Plans', path: '/account/billing/plans', rootPath: '/account/billing' },
  {
    icon: 'shop',
    tooltip: 'Security Logs',
    path: '/account/security/security-log',
    rootPath: '/account/security'
  },
  { icon: 'cheque', tooltip: 'Notifications', path: '/account/notifications', rootPath: '/account/notifications' },
  { icon: 'code', tooltip: 'ACL', path: '/account/members/roles', rootPath: '/account/members' },
  { icon: 'question', tooltip: 'API Keys', path: '/account/api-keys', rootPath: '/account/api-keys' }
];

const flattenMenuToSidebarItems = (menu: TMenuConfig | null | undefined): SidebarNavItem[] => {
  if (!menu) {
    return [];
  }

  const items: SidebarNavItem[] = [];
  const seenPaths = new Set<string>();

  const addItem = (config: IMenuItemConfig) => {
    if (!config.path || seenPaths.has(config.path)) {
      return;
    }

    seenPaths.add(config.path);

    items.push({
      icon: config.icon ?? 'dots-circle-horizontal',
      path: config.path,
      tooltip: config.title ?? config.path,
      rootPath: config.rootPath ?? config.path
    });
  };

  const visit = (configs: TMenuConfig) => {
    configs.forEach((config) => {
      if (config.heading || config.disabled) {
        if (config.children) {
          visit(config.children);
        }
        return;
      }

      if (config.children && config.children.length > 0) {
        if (config.path) {
          addItem(config);
        }
        visit(config.children);
        return;
      }

      addItem(config);
    });
  };

  visit(menu);

  return items;
};

const isSidebarItemActive = (item: SidebarNavItem, pathname: string): boolean => {
  const target = item.rootPath ?? item.path;

  if (!target) {
    return false;
  }

  if (target === '/') {
    return pathname === '/';
  }

  if (pathname === target) {
    return true;
  }

  const normalizedTarget = target.endsWith('/') ? target : `${target}/`;
  return pathname.startsWith(normalizedTarget);
};

const SidebarPrimary = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const itemUserRef = useRef<any>(null);
  const [scrollableHeight, setScrollableHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const scrollableOffset = 80;
  const { isRTL } = useLanguage();
  const { currentUser } = useAuthContext();
  const avatarSrc =
    currentUser?.avatar
      ? `${import.meta.env.VITE_APP_IMAGE_URL}/${currentUser.avatar}`
      : toAbsoluteUrl('/media/avatars/blank.png');

  useEffect(() => {
    if (headerRef.current && footerRef.current) {
      const headerHeight = getHeight(headerRef.current);
      const footerHeight = getHeight(footerRef.current);
      const availableHeight = viewportHeight - headerHeight - footerHeight - scrollableOffset;
      setScrollableHeight(availableHeight);
    } else {
      setScrollableHeight(viewportHeight);
    }
  }, [viewportHeight]);

  const { pathname } = useLocation();
  const { logoSmall, logoDarkSmall } = useBranding();
  const { getMenuConfig } = useMenus();
  const { hasRole } = useRoleAccess();
  const primaryMenu = getMenuConfig('primary');
  const accessibleMenu = useMemo(
    () => filterMenuConfigByRoles(primaryMenu ?? [], hasRole),
    [primaryMenu, hasRole]
  );
  const menuItems = useMemo(() => {
    const flattened = flattenMenuToSidebarItems(accessibleMenu);
    return flattened.length > 0 ? flattened : FALLBACK_ITEMS;
  }, [accessibleMenu]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<SidebarNavItem | null>(null);

  useEffect(() => {
    if (menuItems.length === 0) {
      setSelectedMenuItem(null);
      return;
    }

    const activeItem = menuItems.find((item) => isSidebarItemActive(item, pathname));
    setSelectedMenuItem(activeItem ?? menuItems[0]);
  }, [menuItems, pathname]);
  const itemChatRef = useRef<any>(null);
  const handleDropdownChatShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="flex flex-col items-stretch shrink-0 gap-5 py-5 w-[70px] border-e border-gray-300 dark:border-gray-200">
      <div ref={headerRef} className="hidden lg:flex items-center justify-center shrink-0">
        <Link to="/">
          <img src={logoSmall} className="dark:hidden min-h-[30px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:block min-h-[30px]" alt="logo" />
        </Link>
      </div>
      <div className="flex grow shrink-0">
        <div
          className="scrollable-y-hover grow gap-2.5 shrink-0 flex ps-4 flex-col"
          style={{
            height: `${scrollableHeight}px`
          }}
        >
          {menuItems.map((item) => {
            const isActive = selectedMenuItem?.path === item.path;
            return (
              <DefaultTooltip key={item.path} title={item.tooltip} placement="right">
                <Link
                  to={item.path}
                  className={`btn btn-icon btn-icon-xl rounded-md size-9 border border-transparent text-gray-600 hover:bg-light hover:text-primary hover:border-gray-200${isActive ? ' active bg-light text-primary border-gray-200' : ''}`}
                >
                  <MenuIcon>
                    <KeenIcon icon={item.icon} />
                  </MenuIcon>
                  <span className="tooltip">{item.tooltip}</span>
                </Link>
              </DefaultTooltip>
            );
          })}
        </div>
      </div>
      <div ref={footerRef} className="flex flex-col gap-5 items-center shrink-0">
        <div className="flex flex-col gap-1.5">
          <Menu>
            <MenuItem
              ref={itemChatRef}
              onShow={handleDropdownChatShow}
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'left-end' : 'right-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [10, 15] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-icon btn-icon-xl relative rounded-md size-9 border border-transparent hover:bg-light hover:text-primary hover:border-gray-200 dropdown-open:bg-gray-200 text-gray-600">
                <KeenIcon icon="messages" />
              </MenuToggle>

              {/* {DropdownChat({ menuTtemRef: itemChatRef })} */}
            </MenuItem>
          </Menu>

          <Menu>
            <MenuItem
              ref={itemChatRef}
              onShow={handleDropdownChatShow}
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'left-end' : 'right-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isRTL() ? [10, 15] : [-10, 15] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-icon btn-icon-xl relative rounded-md size-9 border border-transparent hover:bg-light hover:text-primary hover:border-gray-200 dropdown-open:bg-gray-200 text-gray-600">
                <KeenIcon icon="setting-2" />
              </MenuToggle>

              {DropdownApps()}
            </MenuItem>
          </Menu>
        </div>

        <Menu>
          <MenuItem
            ref={itemUserRef}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? 'left-end' : 'right-end',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [10, 15] : [-10, 15] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuToggle className="btn btn-icon rounded-full">
              <img
                className="size-8 rounded-full justify-center border border-gray-500 shrink-0"
                src={avatarSrc}
                alt=""
              />
            </MenuToggle>
            {DropdownUser({ menuItemRef: itemUserRef })}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export { SidebarPrimary };
