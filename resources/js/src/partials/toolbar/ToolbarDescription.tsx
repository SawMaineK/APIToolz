import { IToolbarDescriptionProps } from './types';

const ToolbarDescription = ({ children }: IToolbarDescriptionProps) => {
  return (
    <div className="flex items-center gap-2 text-md font-normal text-gray-700">{children}</div>
  );
};

export { ToolbarDescription };
