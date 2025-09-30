import { KeenIcon } from '@/components';
import { Container } from '@/components/container';
import { Link } from 'react-router-dom';
import { useDemo10Layout } from '..';
import { useBranding } from '@/hooks';

const Header = () => {
  const { setMobileSidebarOpen } = useDemo10Layout();
  const { logoSmall, logoDarkSmall } = useBranding();

  const handleMobileSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  return (
    <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-[--tw-page-bg] h-[--tw-header-height]">
      <Container className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/">
          <img src={logoSmall} className="dark:hidden h-[34px]" alt="logo" />
          <img src={logoDarkSmall} className="hidden dark:inline-block h-[34px]" alt="logo" />
        </Link>

        <button
          onClick={handleMobileSidebarOpen}
          className="btn btn-icon btn-light btn-clear btn-sm me-2"
        >
          <KeenIcon icon="menu" />
        </button>
      </Container>
    </header>
  );
};

export { Header };
