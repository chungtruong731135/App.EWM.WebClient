import { lazy, FC, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { MasterLayout } from '../../_metronic/layout/MasterLayout';
import TopBarProgress from 'react-topbar-progress-indicator';
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils';
import { WithChildren } from '../../_metronic/helpers';

import { SidebarMenu as SidebarMenuSystem } from '@/app/components/sidebar-menu/SidebarMenuSystem';
import { MenuInner as MenuInnerSystem } from '@/app/components/header-menus/MenuInner';
import { useAuth } from '../modules/auth';

const PrivateRoutes = () => {
  const SystemsPage = lazy(() => import('../pages/systems/SystemsPage'));
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Redirect to Dashboard after success login/registartion */}
      <Route path="auth/*" element={<Navigate to={currentUser?.type == 4 || currentUser?.type == 5 ? `/system/sales/dashboard` : `/system/dashboard`} />} />
      {/* Pages */}
      {/* Lazy Modules */}
      <Route path="system/*" element={<MasterLayout asideMenu={<SidebarMenuSystem />} menuInner={<MenuInnerSystem />} />}>
        <Route
          path="*"
          element={
            <SuspensedView>
              <SystemsPage />
            </SuspensedView>
          }
        />
      </Route>
      {/* Page Not Found */}
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--bs-primary');
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
