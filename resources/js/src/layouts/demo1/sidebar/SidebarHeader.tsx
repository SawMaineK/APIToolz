import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';
import { useSettings } from '@/providers';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout } = useDemo1Layout();
  const { settings } = useSettings();

  const lightLogo = () => (
    <Fragment>
      <Link to="/admin" className="dark:hidden">
        <img
          src={toAbsoluteUrl(`${settings.branding.logo_url || ''}`)}
          className="default-logo min-h-[22px] h-[40px] max-w-none"
        />
        <img
          src={toAbsoluteUrl(`${settings.branding.logo_small_url || ''}`)}
          className="small-logo min-h-[22px] max-w-none"
        />
      </Link>
      <Link to="/admin" className="hidden dark:block">
        <img
          src={toAbsoluteUrl(
            `${settings.branding.logo_dark_url || ''}`
          )}
          className="default-logo min-h-[22px] h-[40px] max-w-none"
        />
        <img
          src={toAbsoluteUrl(
            `${settings.branding.logo_dark_small_url || ''}`
          )}
          className="small-logo min-h-[22px] max-w-none"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/admin">
      <img
        src={toAbsoluteUrl(
          `${settings.branding.logo_dark_url || ''}`
        )}
        className="default-logo min-h-[22px] h-[40px] max-w-none"
      />
      <img
        src={toAbsoluteUrl(
          `${settings.branding.logo_dark_small_url || ''}`
        )}
        className="small-logo min-h-[22px] max-w-none"
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
