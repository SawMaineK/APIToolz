import { IToolbarProps } from './types';

const Toolbar = ({ children }: IToolbarProps) => {
  return <div className="grid gap-5 items-start md:grid-cols-3 lg:items-end">{children}</div>;
};

export { Toolbar };
