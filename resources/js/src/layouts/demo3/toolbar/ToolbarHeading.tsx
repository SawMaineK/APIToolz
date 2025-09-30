import { ReactNode } from 'react';
import { useMenuCurrentItem } from '@/components';
import { useAccessibleMenu } from '@/hooks';
import { useLocation } from 'react-router';
import { ToolbarBreadcrumbs } from './ToolbarBreadcrumbs';

export interface IToolbarHeadingProps {
  title?: string | ReactNode;
}

const ToolbarHeading = ({ title = '' }: IToolbarHeadingProps) => {
  const { pathname } = useLocation();
  const currentMenuItem = useMenuCurrentItem(pathname, useAccessibleMenu('primary'));

  return (
    <div className="flex items-center flex-wrap gap-1 lg:gap-5">
      <h1 className="font-medium text-lg text-gray-900">{title || currentMenuItem?.title}</h1>
      <ToolbarBreadcrumbs />
    </div>
  );
};

export { ToolbarHeading };
