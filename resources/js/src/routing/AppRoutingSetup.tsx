import { ReactElement, useEffect, useMemo } from 'react';
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
import { BrandingPage } from '@/pages/branding/BrandingPage';
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
import { useSettings } from '@/providers';

const layoutRegistry = {
  demo1: Demo1Layout,
  demo2: Demo2Layout,
  demo3: Demo3Layout,
  demo4: Demo4Layout,
  demo5: Demo5Layout,
  demo6: Demo6Layout,
  demo7: Demo7Layout,
  demo8: Demo8Layout,
  demo9: Demo9Layout,
  demo10: Demo10Layout
} as const;

type LayoutKey = keyof typeof layoutRegistry;

const DEFAULT_LAYOUT: LayoutKey = 'demo1';

const normalizeLayoutKey = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const isLayoutKey = (value: string): value is LayoutKey =>
  Object.prototype.hasOwnProperty.call(layoutRegistry, value);

const getStoredLayout = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('selectedLayout');
};

const resolveLayoutKey = (preferred?: string | null): LayoutKey => {
  const brandingLayout = normalizeLayoutKey(preferred);

  if (brandingLayout && isLayoutKey(brandingLayout)) {
    return brandingLayout;
  }

  const storedLayout = normalizeLayoutKey(getStoredLayout());

  if (storedLayout && isLayoutKey(storedLayout)) {
    return storedLayout;
  }

  return DEFAULT_LAYOUT;
};

const AppRoutingSetup = (): ReactElement => {
  const { settings } = useSettings();

  const layoutKey = useMemo(
    () => resolveLayoutKey(settings.branding?.layout),
    [settings.branding?.layout]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = localStorage.getItem('selectedLayout');

    if (stored !== layoutKey) {
      localStorage.setItem('selectedLayout', layoutKey);
    }
  }, [layoutKey]);

  const ActiveLayout = layoutRegistry[layoutKey] ?? Demo1Layout;

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<ActiveLayout />}>
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
          <Route path="/admin/branding" element={<BrandingPage />} />
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
