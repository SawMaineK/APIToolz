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
import { UsersPage } from '@/pages/users/UsersPage';
import { RolesPage } from '@/pages/roles/RolesPage';
import { MenuConfigPage } from '@/pages/menu-config/MenuConfigPage';
import { FormBuilderPage } from '@/pages/model/form/FormBuilderPage';
import { SummaryWidgetPage } from '@/pages/model/summary/SummaryWidgetPage';
import { MadePlanPage } from '@/pages/plan/MadePlanPage';
import { RelationshipPage } from '@/pages/model/relationship/RelationshipPage';
import { TrashUsersPage } from '@/pages/users/UsersTrashPage';
import { TrashDataTablePage } from '@/pages/model/datatable/TrashDataTablePage';
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
          <Route path="/admin/plan" element={<MadePlanPage />} />
          <Route path="/admin/plan/:id" element={<MadePlanPage />} />
          <Route path="/admin/model" element={<ModelsPage />} />
          <Route path="/admin/model/relationship" element={<RelationshipPage />} />
          <Route path="/admin/model/:id" element={<DataTablePage />} />
          <Route path="/admin/model/:id/create" element={<CreatePage />} />
          <Route path="/admin/model/:id/update" element={<CreatePage />} />
          <Route path="/admin/model/:id/builder" element={<FormBuilderPage />} />
          <Route path="/admin/model/:id/trash" element={<TrashDataTablePage />} />
          <Route path="/admin/model/:id/summary" element={<SummaryWidgetPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/trash" element={<TrashUsersPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/menu-config" element={<MenuConfigPage />} />
        </Route>
      </Route>
      <Route path="/admin/unauthorized" element={<ErrorsRouting />} />
      <Route path="/admin/error/*" element={<ErrorsRouting />} />
      <Route path="/admin/auth/*" element={<AuthPage />} />
      <Route path="/admin/*" element={<Navigate to="/admin/auth" />} />
      <Route path="/*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
