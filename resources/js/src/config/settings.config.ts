import { TBranding, TMenuConfig } from '@/components';
import { type TKeenIconsStyle } from '../components/keenicons/types';

export type TSettingsThemeMode = 'light' | 'dark' | 'system';

export type TSettingsContainer = 'default' | 'fluid' | 'fixed';

export interface ISettings {
  configId: number;
  configKey: string;
  themeMode: TSettingsThemeMode;
  container: TSettingsContainer;
  keeniconsStyle: TKeenIconsStyle;
  menuConfig: TMenuConfig;
  branding: TBranding;
}

// Default settings for the application
const defaultSettings: ISettings = {
  configId: 1,
  configKey: 'default_settings',
  themeMode: 'light', // Default to light mode for the application
  keeniconsStyle: 'filled', // Default to using filled KeenIcons style
  container: 'fixed', // Default container layout is set to fixed
  branding: {
    app_name: 'APIToolz',
    logo_url: '',
    logo_small_url: '',
    logo_dark_url: '',
    logo_dark_small_url: ''
  },
  menuConfig: [
    {
      title: 'Dashboards',
      icon: 'home-2',
      path: '/admin'
    },
    {
      heading: 'Manage User'
    },
    {
      title: 'Users',
      icon: 'users',
      path: '/admin/users'
    }
  ]
};

export { defaultSettings };
