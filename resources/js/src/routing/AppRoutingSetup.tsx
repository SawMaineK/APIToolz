import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage } from '@/pages/dashboards';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { Demo2Layout } from '@/layouts/demo2';
import { Demo3Layout } from '@/layouts/demo3';
import { ErrorsRouting } from '@/errors';
import { DataTablePage } from '@/pages/model/datatable/DataTablePage';
import { CreatePage } from '@/pages/model/form/CreatePage';
import { ModelsPage } from '@/pages/model/ModelsPage';
import { SettingsPage } from '@/pages/model/settings/SettingsPage';
const getLayout = (): ReactElement => {
  const layout = localStorage.getItem('selectedLayout') || 'demo3';

  switch (layout) {
    case 'demo2':
      return <Demo2Layout />;
    case 'demo3':
      return <Demo3Layout />;
    default:
      return <Demo1Layout />;
  }
};
const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={getLayout()}>
          <Route path="/apitoolz" element={<DefaultPage />} />
          <Route path="/apitoolz/model" element={<ModelsPage />} />
          <Route path="/apitoolz/model/:id" element={<DataTablePage />} />
          <Route path="/apitoolz/model/:id/create" element={<CreatePage />} />
          <Route path="/apitoolz/model/:id/settings/:page" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/apitoolz/error/*" element={<ErrorsRouting />} />
      <Route path="/apitoolz/auth/*" element={<AuthPage />} />
      <Route path="/apitoolz/*" element={<Navigate to="/apitoolz/auth" />} />
      <Route path="/*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
