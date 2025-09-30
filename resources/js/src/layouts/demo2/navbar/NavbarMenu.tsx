import { useMemo } from 'react';
import { KeenIcon } from '@/components/keenicons';
import {
  Menu,
  MenuArrow,
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components/menu';
import { useMenus } from '@/providers';
import { useLanguage } from '@/i18n';
import { useRoleAccess } from '@/auth';
import { filterMenuConfigByRoles } from '@/components/menu/utils';

const NavbarMenu = () => {
  const { getMenuConfig } = useMenus();
  const primaryMenu = getMenuConfig('primary');
  const { isRTL } = useLanguage();
  const { hasRole } = useRoleAccess();

  const navbarMenu = useMemo(() => {
    return filterMenuConfigByRoles(primaryMenu ?? [], hasRole);
  }, [primaryMenu, hasRole]);

  const buildMenu = (items?: TMenuConfig | null) => {
    const filteredItems = filterMenuConfigByRoles(items ?? [], hasRole).filter(
      (item) => item.title !== 'New Item' && item.title != null
    );
    return filteredItems.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900"
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? 'bottom-end' : 'bottom-start'
            }}
          >
            <MenuLink className="gap-1.5 pb-2 lg:pb-4">
              <MenuTitle className="text-nowrap text-sm text-gray-800 menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
              <MenuArrow>
                <KeenIcon icon="down" className="text-2xs text-gray-500" />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="menu-default py-2" rootClassName="min-w-[200px]">
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem
            key={index}
            className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900"
          >
            <MenuLink path={item.path?.toLowerCase()} className="gap-2.5 pb-2 lg:pb-4">
              <MenuTitle className="text-nowrap text-sm text-gray-800 menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
      return null;
    });
  };

  const buildMenuChildren = (items?: TMenuConfig | null) => {
    const filteredItems = filterMenuConfigByRoles(items ?? [], hasRole).filter(
      (item) => item.title !== 'New Item' && item.title != null
    );
    return filteredItems.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? 'left-start' : 'right-start',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [-10, 0] }
                }
              ]
            }}
          >
            <MenuLink>
              <MenuTitle>{item.title}</MenuTitle>
              <MenuArrow>
                <KeenIcon icon="down" className="text-2xs [.menu-dropdown_&]:-rotate-90" />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="menu-default" rootClassName="min-w-[200px]">
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem key={index}>
            <MenuLink path={item.path?.toLowerCase()}>
              <MenuTitle>{item.title}</MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
      return null;
    });
  };

  return (
    <div className="grid">
      <div className="scrollable-x-auto">
        <Menu highlight={true} className="gap-5 lg:gap-7.5">
          {navbarMenu && buildMenu(navbarMenu)}
        </Menu>
      </div>
    </div>
  );
};

export { NavbarMenu };
