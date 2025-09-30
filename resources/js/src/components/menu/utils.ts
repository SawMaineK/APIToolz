import { Children, isValidElement, ReactNode } from 'react';
import { MenuLink } from './MenuLink';
import { matchPath } from 'react-router';
import { IMenuItemConfig, TMenuConfig } from './types.d';

export const getMenuLinkPath = (children: ReactNode): string => {
  let path = '';

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === MenuLink && child.props.path) {
      path = child.props.path; // Assign the path when found
    }
  });

  return path;
};

export const hasMenuActiveChild = (path: string, children: ReactNode): boolean => {
  const childrenArray: ReactNode[] = Children.toArray(children);

  for (const child of childrenArray) {
    if (isValidElement(child)) {
      if (child.type === MenuLink && child.props.path) {
        if (path === '/') {
          if (child.props.path === path) {
            return true;
          }
        } else {
          if (matchPath(child.props.path as string, path)) {
            return true;
          }
        }
      } else if (hasMenuActiveChild(path, child.props.children as ReactNode)) {
        return true;
      }
    }
  }

  return false;
};

const filterMenuChildrenByRoles = (
  items: TMenuConfig | undefined,
  hasRole: (roles?: string[]) => boolean
): TMenuConfig => {
  if (!items) {
    return [];
  }

  return items
    .map((item) => {
      if (!hasRole(item.roles)) {
        return null;
      }

      const filteredChildren = filterMenuChildrenByRoles(item.children, hasRole);

      if (filteredChildren.length > 0) {
        return { ...item, children: filteredChildren };
      }

      if (item.children && !item.path) {
        return null;
      }

      if (item.children && filteredChildren.length === 0) {
        const { children, ...rest } = item;
        return rest;
      }

      return item;
    })
    .filter(Boolean) as TMenuConfig;
};

export const filterMenuConfigByRoles = (
  items: TMenuConfig | undefined,
  hasRole: (roles?: string[]) => boolean
): TMenuConfig => {
  return filterMenuChildrenByRoles(items, hasRole);
};

export const menuItemHasAccess = (
  item: IMenuItemConfig | undefined,
  hasRole: (roles?: string[]) => boolean
): boolean => {
  if (!item) {
    return false;
  }

  if (!hasRole(item.roles)) {
    return false;
  }

  if (!item.children || item.children.length === 0) {
    return true;
  }

  const accessibleChildren = filterMenuChildrenByRoles(item.children, hasRole);

  if (accessibleChildren.length === 0 && !item.path) {
    return false;
  }

  return true;
};
