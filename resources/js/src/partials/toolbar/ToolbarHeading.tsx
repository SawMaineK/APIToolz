import { IToolbarHeadingProps } from './types';

const ToolbarHeading = ({ children }: IToolbarHeadingProps) => {
  return (
    <div className="flex flex-col justify-center gap-2 sm:col-span-1 md:col-span-2">{children}</div>
  );
};

export { ToolbarHeading };
