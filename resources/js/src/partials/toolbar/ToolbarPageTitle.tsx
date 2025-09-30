import { useLocation } from 'react-router';

import { useMenuCurrentItem } from '@/components/menu';
import { useMenus } from '@/providers';

import { IToolbarPageTitleProps } from './types';

const ToolbarPageTitle = ({ text }: IToolbarPageTitleProps) => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  return <h2 className="text-xl font-bold">{text ?? menuItem?.title}</h2>;
};

export { ToolbarPageTitle };
