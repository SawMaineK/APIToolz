import { Link, useLocation } from 'react-router-dom';
import { KeenIcon, Menu, MenuItem, MenuToggle, DefaultTooltip, MenuIcon } from '@/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getHeight, toAbsoluteUrl } from '@/utils';
import { useBranding, useViewport } from '@/hooks';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { filterMenuConfigByRoles } from '@/components/menu/utils';
import { IMenuItemConfig, TMenuConfig } from '@/components/menu';
import { toPascalCase } from '@/pages/dashboards';
import * as LucideIcons from 'lucide-react';

interface SidebarNavItem {
  icon: string;
  tooltip: string;
  path: string;
  rootPath?: string;
}

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
        return; // skip headings and disabled
      }

      if (config.children && config.children.length > 0) {
        return; // skip parent menus with children
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
  const avatarSrc = currentUser?.avatar
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
    return flattenMenuToSidebarItems(accessibleMenu);
  }, [accessibleMenu]);

  const [selectedMenuItem, setSelectedMenuItem] = useState<SidebarNavItem | null>(null);

  useEffect(() => {
    if (menuItems.length === 0) {
      setSelectedMenuItem(null);
      return;
    }

    const activeItem = menuItems.find((item) => isSidebarItemActive(item, pathname));

    if (activeItem) {
      setSelectedMenuItem(activeItem);
    } else {
      setSelectedMenuItem(null); // no fallback to index 0
    }
  }, [menuItems, pathname]);

  return (
    <div className="flex flex-col items-stretch shrink-0 gap-5 py-5 w-[70px] border-e border-gray-300 dark:border-gray-200">
      {/* Header Logo */}
      <div ref={headerRef} className="hidden lg:flex items-center justify-center shrink-0">
        <Link to="/">
          <img src={logoSmall} className="dark:hidden min-h-[30px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:block min-h-[30px]" alt="logo" />
        </Link>
      </div>

      {/* Sidebar Menu */}
      <div className="flex grow shrink-0">
        <div
          className="scrollable-y-hover grow gap-2.5 shrink-0 flex ps-4 flex-col"
          style={{
            height: `${scrollableHeight}px`
          }}
        >
          {menuItems.map((item) => {
            const IconName = item.icon ? toPascalCase(item.icon) : null;
            const Icon = IconName && (LucideIcons as any)[IconName];
            const isActive = isSidebarItemActive(item, pathname);

            return (
              <DefaultTooltip key={item.path?.toLowerCase()} title={item.tooltip} placement="right">
                <Link
                  to={item.path?.toLowerCase()}
                  className={`btn btn-icon btn-icon-xl rounded-md size-9 border border-transparent text-gray-600 hover:bg-light hover:text-primary hover:border-gray-200${
                    isActive ? ' active bg-light text-primary border-gray-200' : ''
                  }`}
                >
                  <MenuIcon>
                    {item.icon && Icon && <Icon className="w-5 h-5" />}
                    {item.icon && !Icon && <KeenIcon icon={item.icon} className="text-lg" />}
                  </MenuIcon>
                  <span className="tooltip">{item.tooltip}</span>
                </Link>
              </DefaultTooltip>
            );
          })}
        </div>
      </div>

      {/* Footer User Menu */}
      <div ref={footerRef} className="flex flex-col gap-5 items-center shrink-0">
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
                  options: { offset: isRTL() ? [10, 15] : [-10, 15] }
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
