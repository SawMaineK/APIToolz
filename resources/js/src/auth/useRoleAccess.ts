import { useCallback, useMemo } from 'react';

import { useAuthContext } from './useAuthContext';

type Role = string | { name?: string } | null | undefined;

const normalizeRole = (role: Role): string | null => {
  if (!role) {
    return null;
  }

  if (typeof role === 'string') {
    return role;
  }

  return role.name ?? null;
};

const useRoleAccess = () => {
  const { currentUser } = useAuthContext();

  const roles = useMemo(() => {
    return (currentUser?.roles ?? [])
      .map((role: Role) => normalizeRole(role))
      .filter((role: string | null): role is string => Boolean(role));
  }, [currentUser?.roles]);

  const hasRole = useCallback(
    (allowedRoles?: string[]) => {
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }

      return roles.some((role) => allowedRoles.includes(role));
    },
    [roles]
  );

  const isSuperAdmin = useCallback(() => hasRole(['super']), [hasRole]);

  return { roles, hasRole, isSuperAdmin };
};

export { useRoleAccess };
