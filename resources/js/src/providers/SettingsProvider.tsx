import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { defaultSettings, ISettings, type TSettingsThemeMode } from '@/config/settings.config';
import { IMenuItemConfig, TMenuConfig } from '@/components/menu';

import { getData, setData } from '@/utils';
import axios from 'axios';

export interface ISettingsProps {
  settings: ISettings;
  storeSettings: (settings: Partial<ISettings>) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  getThemeMode: () => TSettingsThemeMode;
  getSettings: () => Promise<void>;
}

const SETTINGS_CONFIGS_KEY = 'settings-configs';

const BRANDING_PATH = '/admin/branding';

const BRANDING_MENU_ITEM: IMenuItemConfig = {
  title: 'Branding',
  icon: 'brush',
  path: BRANDING_PATH,
  roles: ['super', 'admin']
};

const cloneMenuConfig = (items?: TMenuConfig | null): TMenuConfig => {
  if (!items) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    ...(item.children ? { children: cloneMenuConfig(item.children) } : {})
  }));
};

const containsBrandingMenu = (items?: TMenuConfig | null): boolean => {
  if (!items) {
    return false;
  }

  return items.some((item) => {
    if (item.path === BRANDING_PATH) {
      return true;
    }

    if (item.children && item.children.length > 0) {
      return containsBrandingMenu(item.children);
    }

    return false;
  });
};

const insertBrandingMenu = (items: TMenuConfig): boolean => {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    if (item.children && insertBrandingMenu(item.children)) {
      return true;
    }

    const titleKey = item.title?.toLowerCase();
    const headingKey = item.heading?.toLowerCase();

    if (titleKey === 'settings') {
      if (item.children && item.children.length > 0) {
        item.children = [...item.children, { ...BRANDING_MENU_ITEM }];
      } else {
        items.splice(index + 1, 0, { ...BRANDING_MENU_ITEM });
      }
      return true;
    }

    if (headingKey === 'settings') {
      items.splice(index + 1, 0, { ...BRANDING_MENU_ITEM });
      return true;
    }
  }

  return false;
};

const ensureBrandingMenu = (menu: TMenuConfig | null): TMenuConfig => {
  const clonedMenu = cloneMenuConfig(menu);

  if (containsBrandingMenu(clonedMenu)) {
    return clonedMenu;
  }

  if (!insertBrandingMenu(clonedMenu)) {
    clonedMenu.push({ ...BRANDING_MENU_ITEM });
  }

  return clonedMenu;
};

const getStoredSettings = (): Partial<ISettings> => {
  return (getData(SETTINGS_CONFIGS_KEY) as Partial<ISettings>) || {};
};

const initialProps: ISettingsProps = {
  settings: { ...defaultSettings, ...getStoredSettings() },
  updateSettings: (settings: Partial<ISettings>) => {},
  storeSettings: (settings: Partial<ISettings>) => {},
  getThemeMode: () => 'light',
  getSettings: async () => {}
};

const LayoutsContext = createContext<ISettingsProps>(initialProps);
const useSettings = () => useContext(LayoutsContext);

const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState(initialProps.settings);

  const updateSettings = (newSettings: Partial<ISettings>) => {
    const normalizedMenu = ensureBrandingMenu(newSettings.menuConfig ?? settings.menuConfig);
    setSettings({ ...settings, ...newSettings, menuConfig: normalizedMenu });
  };

  const storeSettings = (newSettings: Partial<ISettings>) => {
    const normalizedMenu = ensureBrandingMenu(newSettings.menuConfig ?? settings.menuConfig);
    setData(SETTINGS_CONFIGS_KEY, {
      ...getStoredSettings(),
      ...newSettings,
      menuConfig: normalizedMenu
    });
    updateSettings({ ...newSettings, menuConfig: normalizedMenu });
  };

  const getSettings = async () => {
    try {
      const data = await axios
        .get(`${import.meta.env.VITE_APP_API_URL}/appsetting?filter=key:${settings.configKey}`)
        .then((settings) => {
          return settings.data.data[0] || null;
        });
      updateSettings({ configId: data.id, menuConfig: data.menu_config, branding: data.branding });
    } catch (e) {
      return;
    }
  };

  const getThemeMode = (): TSettingsThemeMode => {
    const { themeMode } = settings;

    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (themeMode === 'dark') {
      return 'dark';
    } else {
      return 'light';
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <LayoutsContext.Provider
      value={{ settings, updateSettings, storeSettings, getThemeMode, getSettings }}
    >
      {children}
    </LayoutsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { SettingsProvider, useSettings };
