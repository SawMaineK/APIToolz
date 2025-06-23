import React, { Fragment, useEffect, useState } from 'react';

import { Container } from '@/components/container';
import MenuConfig from './MenuConfig';
import axios from 'axios';
import { useSettings } from '@/providers';

const MenuConfigPage: React.FC = () => {
  const { settings } = useSettings();
  const [menuConfig, setMenuConfig] = useState<any[] | null>(null);
  useEffect(() => {
    getMenuSettings();
  }, []);
  const getMenuSettings = async () => {
    try {
      const data = await axios
        .get(`${import.meta.env.VITE_APP_API_URL}/appsetting?filter=key:${settings.configKey}`)
        .then((settings) => {
          return settings.data.data[0] || null;
        });
      setMenuConfig(data.menu_config);
    } catch (e) {
      return;
    }
  };
  return (
    <Fragment>
      <Container>{menuConfig && <MenuConfig menu={menuConfig} />}</Container>
    </Fragment>
  );
};

export { MenuConfigPage };
