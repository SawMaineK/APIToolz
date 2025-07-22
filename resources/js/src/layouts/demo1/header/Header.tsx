import clsx from 'clsx';
import { useEffect } from 'react';
import { Container } from '@/components/container';
import { MegaMenu } from '../mega-menu';
import { HeaderLogo, HeaderTopbar } from './';
import { useDemo1Layout } from '../';
import { useAuthContext } from '@/auth';

const Header = () => {
  const { headerSticky } = useDemo1Layout();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerSticky]);

  return (
    <header
      className={clsx(
        'header fixed top-0 z-10 start-0 end-0 flex items-stretch shrink-0 bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark]',
        headerSticky && 'shadow-sm'
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        <HeaderLogo />
        {/* <div></div> */}
        <div className="mt-7">
          {currentUser?.roles?.some((role: any) => (role?.name ?? role) === 'super') ? (
            <MegaMenu />
          ) : null}
        </div>
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };
