import { useBranding } from '@/hooks';

const ScreenLoader = () => {
  const { logoSmall, logoDarkSmall } = useBranding();
  return (
    <div className="flex flex-col items-center gap-2 justify-center fixed inset-0 z-50 bg-light transition-opacity duration-700 ease-in-out">
      <img className="h-[30px] max-w-none dark:hidden" src={logoSmall} alt="logo" />
      <img className="h-[30px] max-w-none hidden dark:block" src={logoDarkSmall} alt="logo" />
      <div className="text-gray-500 font-medium text-sm">Loading...</div>
    </div>
  );
};

export { ScreenLoader };
