import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { MegaMenu } from '../mega-menu';
import { useDemo7Layout } from '@/layouts/demo7/Demo7LayoutProvider';
import { useBranding } from '@/hooks';

const HeaderLogo = () => {
  const { setMobileMegaMenuOpen } = useDemo7Layout();
  const { appName, logoSmall, logoDarkSmall } = useBranding();

  const handleMobileMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };

  return (
    <div className="flex items-stretch gap-10 grow">
      <div className="flex items-center gap-2.5">
        <Link to="/">
          <img src={logoSmall} className="dark:hidden min-h-[34px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:inline-block min-h-[34px]" alt="logo" />
        </Link>
        <button
          className="lg:hidden btn btn-icon btn-light btn-clear btn-sm"
          onClick={handleMobileMegaMenuOpen}
        >
          <KeenIcon icon="burger-menu-2" />
        </button>
        <h3 className="text-gray-900 text-lg font-medium hidden md:block">{appName}</h3>
      </div>

      <MegaMenu />
    </div>
  );
};

export { HeaderLogo };
