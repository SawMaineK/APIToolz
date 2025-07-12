import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { DefaultPage } from '@/pages/dashboards';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';
import { DataTablePage } from '@/pages/model/datatable/DataTablePage';
import { CreatePage } from '@/pages/model/form/CreatePage';
import { ModelsPage } from '@/pages/model/ModelsPage';
import { SettingsPage } from '@/pages/model/settings/SettingsPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { RolesPage } from '@/pages/roles/RolesPage';
import { MenuConfigPage } from '@/pages/menu-config/MenuConfigPage';
import { FormBuilderPage } from '@/pages/model/form/FormBuilderPage';
import { ModelHightlightPage } from '@/pages/model/ModelHightlightPage';
import { SummaryWidgetPage } from '@/pages/model/summary/SummaryWidgetPage';
import { GeneralAIAssistPage } from '@/pages/general-ai-assist/GeneralAIAssistPage';
const getLayout = (): ReactElement => {
  const layout = localStorage.getItem('selectedLayout') || 'demo1';

  switch (layout) {
    default:
      return <Demo1Layout />;
  }
};
const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={getLayout()}>
          <Route path="/admin" element={<DefaultPage />} />
          <Route path="/admin/model" element={<ModelsPage />} />
          <Route path="/admin/model/:id" element={<DataTablePage />} />
          <Route path="/admin/model/:id/create" element={<CreatePage />} />
          <Route path="/admin/model/:id/update" element={<CreatePage />} />
          <Route path="/admin/model/:id/builder" element={<FormBuilderPage />} />
          <Route path="/admin/model/:id/:config" element={<ModelHightlightPage />} />
          <Route path="/admin/model/:id/settings/:page" element={<SettingsPage />} />
          <Route path="/admin/model/:id/summary" element={<SummaryWidgetPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/menu-config" element={<MenuConfigPage />} />
          <Route path="/admin/general-aiassist" element={<GeneralAIAssistPage />} />
        </Route>
      </Route>
      <Route path="/admin/error/*" element={<ErrorsRouting />} />
      <Route path="/admin/auth/*" element={<AuthPage />} />
      <Route path="/admin/*" element={<Navigate to="/admin/auth" />} />
      <Route path="/*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
