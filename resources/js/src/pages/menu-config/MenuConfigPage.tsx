import React, { Fragment, useEffect, useState } from 'react';

import { Container } from '@/components/container';
import MenuConfig from './MenuConfig';
import axios from 'axios';
import { useSettings } from '@/providers';
import MenuEditor, { MenuItem } from './MenuEditor';
import { v4 as uuidv4 } from 'uuid';
function ensureIds(items: any[]): any[] {
  return items.map((item) => {
    const withId = {
      ...item,
      id: item.id || uuidv4() // add id if missing
    };
    if (withId.children && Array.isArray(withId.children)) {
      withId.children = ensureIds(withId.children);
    }
    return withId;
  });
}
const MenuConfigPage: React.FC = () => {
  const { settings } = useSettings();
  const [menuConfig, setMenuConfig] = useState<MenuItem[] | undefined>();
  useEffect(() => {
    getMenuSettings();
  }, []);
  const getMenuSettings = async () => {
    try {
      const data = await axios
        .get(`${import.meta.env.VITE_APP_API_URL}/appsetting?filter=key:${settings.configKey}`)
        .then((settings) => {
          return settings.data.data[0] || undefined;
        });
      setMenuConfig((prev) => {
        return ensureIds(data.menu_config);
      });
    } catch (e) {
      return;
    }
  };
  return (
    <Fragment>
      {/* <Container>{menuConfig && <MenuConfig menu={menuConfig} />}</Container> */}
      <Container>{menuConfig && <MenuEditor defaultData={menuConfig} />}</Container>
    </Fragment>
  );
};

export { MenuConfigPage };
