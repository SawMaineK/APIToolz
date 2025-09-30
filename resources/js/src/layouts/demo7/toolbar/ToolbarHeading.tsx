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
    <div className="flex flex-col gap-1">
      <h1 className="font-medium text-lg text-gray-900">{title || currentMenuItem?.title}</h1>
      <ToolbarBreadcrumbs />
    </div>
  );
};

export { ToolbarHeading };
