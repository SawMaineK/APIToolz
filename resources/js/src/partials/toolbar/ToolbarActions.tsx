import { IToolbarActionsProps } from './types';

const ToolbarActions = ({ children }: IToolbarActionsProps) => {
  return (
    <div className="inline-flex w-fit items-center gap-2.5 justify-self-start md:col-span-1 md:justify-self-end">
      {children}
    </div>
  );
};

export { ToolbarActions };
