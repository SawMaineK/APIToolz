import { IToolbarActionsProps } from './types';

const ToolbarActions = ({ children }: IToolbarActionsProps) => {
  return (
    <div className="flex items-center gap-2.5 md:col-span-1 md:flex md:justify-end">{children}</div>
  );
};

export { ToolbarActions };
