/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { useResponsive, useViewport } from '@/hooks';
import { useDemo3Layout } from '..';
import { useEffect, useMemo, useState } from 'react';
import { useMenus, usePathname } from '@/providers';
import { useRoleAccess } from '@/auth';
import { filterMenuConfigByRoles } from '@/components/menu/utils';
import { IMenuItemConfig, TMenuConfig } from '@/components/menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

interface SidebarNavItem {
  icon: string;
  path: string;
  tooltip: string;
  rootPath?: string;
}

const FALLBACK_ITEMS: SidebarNavItem[] = [
  {
    icon: 'chart-line-star',
    path: '/',
    tooltip: 'Dashboard',
    rootPath: '/'
  },
  {
    icon: 'profile-circle',
    path: '/public-profile/profiles/default',
    tooltip: 'Profile',
    rootPath: '/public-profile/'
  },
  {
    icon: 'setting-2',
    path: '/account/home/get-started',
    tooltip: 'Account',
    rootPath: '/account/'
  },
  {
    icon: 'users',
    path: '/network/get-started',
    tooltip: 'Network',
    rootPath: '/network/'
  },
  {
    icon: 'security-user',
    path: '/authentication/get-started',
    tooltip: 'Authentication',
    rootPath: '/authentication/'
  },
  {
    icon: 'code',
    path: '/account/billing/plans',
    tooltip: 'Plans',
    rootPath: '/account/billing'
  },
  {
    icon: 'shop',
    path: '/account/security/security-log',
    tooltip: 'Security Logs',
    rootPath: '/account/security'
  },
  {
    icon: 'cheque',
    path: '/account/notifications',
    tooltip: 'Notifications',
    rootPath: '/account/notifications'
  },
  {
    icon: 'code',
    path: '/account/members/roles',
    tooltip: 'ACL',
    rootPath: '/account/members'
  },
  {
    icon: 'question',
    path: '/account/api-keys',
    tooltip: 'API Keys',
    rootPath: '/account/api-keys'
  }
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

const isSidebarPathActive = (item: SidebarNavItem, pathname: string): boolean => {
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

const Sidebar = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useDemo3Layout();
  const { pathname, prevPathname } = usePathname();
  const desktopMode = useResponsive('up', 'lg');
  const mobileMode = useResponsive('down', 'lg');
  const [viewportHeight] = useViewport();
  const scrollableOffset = 70;
  const scrollableHeight = viewportHeight - scrollableOffset;
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

    const activeItem = menuItems.find((item) => isSidebarPathActive(item, pathname));

    if (activeItem) {
      setSelectedMenuItem(activeItem);
    } else {
      setSelectedMenuItem(menuItems[0]);
    }
  }, [menuItems, pathname]);

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const renderContent = () => {
    return (
      <div className="fixed w-[--tw-sidebar-width] lg:top-[--tw-header-height] top-0 bottom-0 z-20 lg:flex flex-col items-stretch shrink-0 group py-3 lg:py-0">
        <div className="flex grow shrink-0">
          <div
            className="scrollable-y-auto grow gap-2.5 shrink-0 flex items-center flex-col"
            style={{
              ...(desktopMode && scrollableHeight > 0 && { height: `${scrollableHeight}px` })
            }}
          >
            {menuItems.map((item) => {
              const isExternal = item.path.startsWith('http');
              const isActive = selectedMenuItem?.path === item.path;
              const baseClasses =
                'btn btn-icon btn-icon-lg rounded-full size-10 border text-gray-600 hover:bg-light hover:text-primary hover:border-gray-300';
              const activeClasses = isActive ? ' bg-light text-primary border-gray-300' : '';

              if (isExternal) {
                return (
                  <a
                    href={item.path}
                    key={item.path}
                    data-tooltip={item.tooltip}
                    data-tooltip-placement="right"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClasses}${activeClasses}`}
                  >
                    <span className="menu-icon">
                      <KeenIcon icon={item.icon} />
                    </span>
                    <span className="tooltip">{item.tooltip}</span>
                  </a>
                );
              }

              return (
                <Link
                  to={item.path}
                  key={item.path}
                  data-tooltip={item.tooltip}
                  data-tooltip-placement="right"
                  className={`${baseClasses} active:border-gray-300${activeClasses}`}
                >
                  <span className="menu-icon">
                    <KeenIcon icon={item.icon} />
                  </span>
                  <span className="tooltip">{item.tooltip}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (mobileMode && prevPathname !== pathname) {
      handleMobileSidebarClose();
    }
  }, [mobileMode, pathname, prevPathname]);

  if (desktopMode) {
    return renderContent();
  } else {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          className="border-0 p-0 w-[--tw-sidebar-width] scrollable-y-auto"
          forceMount={true}
          side="left"
          close={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Mobile Menu</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          {renderContent()}
        </SheetContent>
      </Sheet>
    );
  }
};

export { Sidebar };
