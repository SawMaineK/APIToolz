import { useMemo } from 'react';

import { TBranding } from '@/components/menu';
import { useSettings } from '@/providers';
import { toAbsoluteUrl } from '@/utils';

type BrandingAssets = {
  appName: string;
  logo: string;
  logoSmall: string;
  logoDark: string;
  logoDarkSmall: string;
  themeColor: string;
};

const DEFAULT_LOGO = '/media/app/default-logo.svg';
const DEFAULT_LOGO_SMALL = '/media/app/mini-logo.svg';
const DEFAULT_THEME_COLOR = '#00A193';

const resolveAsset = (path: string | undefined, fallback: string) => {
  const assetPath = path?.trim();

  if (!assetPath || assetPath.length === 0) {
    return toAbsoluteUrl(fallback);
  }

  if (/^(?:https?:)?\/\//.test(assetPath) || assetPath.startsWith('data:')) {
    return assetPath;
  }

  return toAbsoluteUrl(assetPath);
};

const resolveBrandingAssets = (branding?: TBranding | null): BrandingAssets => {
  const source = branding ?? {};
  const logo = resolveAsset(source.logo_url, DEFAULT_LOGO);
  const logoSmall = resolveAsset(source.logo_small_url ?? source.logo_url, DEFAULT_LOGO_SMALL);
  const logoDark = resolveAsset(source.logo_dark_url ?? source.logo_url, DEFAULT_LOGO);
  const logoDarkSmall = resolveAsset(
    source.logo_dark_small_url ??
      source.logo_dark_url ??
      source.logo_small_url ??
      source.logo_url,
    DEFAULT_LOGO_SMALL
  );
  const themeColor = source.theme_color && source.theme_color.length > 0
    ? source.theme_color
    : DEFAULT_THEME_COLOR;

  return {
    appName: source.app_name && source.app_name.length > 0 ? source.app_name : 'APIToolz',
    logo,
    logoSmall,
    logoDark,
    logoDarkSmall,
    themeColor
  };
};

const useBranding = (): BrandingAssets => {
  const { settings } = useSettings();

  return useMemo(() => resolveBrandingAssets(settings.branding), [settings.branding]);
};

export { useBranding, resolveBrandingAssets };
export type { BrandingAssets };
