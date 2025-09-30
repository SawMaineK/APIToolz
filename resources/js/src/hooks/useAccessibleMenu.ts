import { useMemo } from 'react';
import { useMenus } from '@/providers';
import { useRoleAccess } from '@/auth';
import { filterMenuConfigByRoles } from '@/components/menu/utils';
import { TMenuConfig } from '@/components/menu';

export const useAccessibleMenu = (name: string): TMenuConfig => {
  const { getMenuConfig } = useMenus();
  const { hasRole } = useRoleAccess();
  const config = getMenuConfig(name);

  return useMemo(() => filterMenuConfigByRoles(config ?? [], hasRole), [config, hasRole]);
};
