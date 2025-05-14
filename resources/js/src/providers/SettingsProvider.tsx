import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { defaultSettings, ISettings, type TSettingsThemeMode } from '@/config/settings.config';

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
    setSettings({ ...settings, ...newSettings });
  };

  const storeSettings = (newSettings: Partial<ISettings>) => {
    setData(SETTINGS_CONFIGS_KEY, { ...getStoredSettings(), ...newSettings });
    updateSettings(newSettings);
  };

  const getSettings = async () => {
    try {
      const data = await axios
        .get(`${import.meta.env.VITE_APP_API_URL}/appsetting?filter=key:${settings.configKey}`)
        .then((settings) => {
          return settings.data.data[0] || null;
        });
      updateSettings({ configId: data.id, menuConfig: data.menu_config });
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
