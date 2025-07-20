import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/loaders';
import { useAuthContext } from './useAuthContext';
import { useSettings } from '@/providers';

type MenuItem = {
  icon?: string;
  path?: string;
  title?: string;
  heading?: string;
  roles?: string[];
  children?: MenuItem[];
};

const RequireAuth = () => {
  const { auth, loading, currentUser } = useAuthContext();
  const { settings } = useSettings();
  const location = useLocation();

  if (loading) return <ScreenLoader />;

  // ✅ Normalize path
  const normalizePath = (path: string): string => {
    let cleaned = path.replace(/\/+$/, ''); // remove trailing slashes

    // Strip `/create`
    if (cleaned.endsWith('/create')) {
      cleaned = cleaned.replace(/\/create$/, '');
    }
    if (cleaned.endsWith('/update')) {
      cleaned = cleaned.replace(/\/update$/, '');
    }

    return cleaned;
  };

  const currentPath = normalizePath(location.pathname);

  /**
   * Find menu recursively & merge parent roles
   */
  const findMenuWithParent = (
    menus: MenuItem[],
    path: string,
    parentRoles: string[] = []
  ): { menu: MenuItem | null; roles: string[] } => {
    for (const menu of menus) {
      const combinedRoles = [...(parentRoles || []), ...(menu.roles || [])];

      if (menu.path) {
        // ✅ Exact match
        if (path === menu.path) {
          return { menu, roles: combinedRoles };
        }

        // ✅ Detail view (menuPath + /id)
        const withoutPrefix = path.replace(menu.path, '').replace(/^\/+/, '');
        const isDetail = withoutPrefix.length > 0 && !withoutPrefix.includes('/');
        if (path.startsWith(menu.path + '/') && isDetail) {
          return { menu, roles: combinedRoles };
        }
      }

      // ✅ Recurse children
      if (menu.children) {
        const found = findMenuWithParent(menu.children, path, combinedRoles);
        if (found.menu) return found;
      }
    }
    return { menu: null, roles: parentRoles };
  };

  // ✅ Find menu & roles after normalization
  const { menu: matchedMenu, roles: requiredRoles } = findMenuWithParent(
    settings.menuConfig as MenuItem[],
    currentPath
  );

  if (!auth) {
    return <Navigate to="/admin/auth/login" state={{ from: location }} replace />;
  }

  if (!matchedMenu) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // ✅ If no roles required → allow any authenticated user
  if (requiredRoles.length === 0) {
    return <Outlet />;
  }

  const userRoles = currentUser?.roles || [];

  // ✅ Check intersection between user roles & required roles
  const hasAccess = userRoles.some((role) => requiredRoles.includes(role.name));

  if (!hasAccess) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <Outlet />;
};

export { RequireAuth };
