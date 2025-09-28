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
import { PermissionsPage } from '@/pages/roles/PermissionsPage';
import { WorkflowRunnerPage } from '@/pages/workflows/WorkflowRunnerPage';
import { WorkflowsPage } from '@/pages/workflows/WorkflowsPage';
import { WorkflowDefinitionPage } from '@/pages/workflows/WorkflowDefinitionPage';
import WorkflowHistoryPage from '@/pages/workflows/WorkflowHistoryPage';
import { Demo2Layout } from '@/layouts/demo2';
import { Demo3Layout } from '@/layouts/demo3';
import { Demo4Layout } from '@/layouts/demo4';
import { Demo5Layout } from '@/layouts/demo5';
import { Demo6Layout } from '@/layouts/demo6';
import { Demo7Layout } from '@/layouts/demo7';
import { Demo8Layout } from '@/layouts/demo8';
import { Demo9Layout } from '@/layouts/demo9';
import { Demo10Layout } from '@/layouts/demo10';
import { IntegrationsPage } from '@/pages/integrations/IntegrationPage';
import { IntDefinitionPage } from '@/pages/integrations/IntDefinitionPage';
import { WorkflowInstancesPage } from '@/pages/workflows/histories/WorkflowInstancesPage';
const getLayout = (): ReactElement => {
  const layout = localStorage.getItem('selectedLayout') || 'demo1';

  switch (layout) {
    case 'demo2':
      return <Demo2Layout />;
    case 'demo3':
      return <Demo3Layout />;
    case 'demo4':
      return <Demo4Layout />;
    case 'demo5':
      return <Demo5Layout />;
    case 'demo6':
      return <Demo6Layout />;
    case 'demo7':
      return <Demo7Layout />;
    case 'demo8':
      return <Demo8Layout />;
    case 'demo9':
      return <Demo9Layout />;
    case 'demo10':
      return <Demo10Layout />;
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
          <Route path="/admin/workflows" element={<WorkflowsPage />} />
          <Route path="/admin/workflow/definition" element={<WorkflowDefinitionPage />} />
          <Route path="/admin/workflow/:id" element={<WorkflowRunnerPage />} />
          <Route path="/admin/workflow/:id/instances" element={<WorkflowInstancesPage />} />
          <Route path="/admin/workflow/:id/:instanceId" element={<WorkflowRunnerPage />} />
          <Route path="/admin/workflow/:instanceId/history" element={<WorkflowHistoryPage />} />
          <Route path="/admin/integrations" element={<IntegrationsPage />} />
          <Route path="/admin/integration/definition" element={<IntDefinitionPage />} />
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
          <Route path="/admin/permission/:role" element={<PermissionsPage />} />
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
