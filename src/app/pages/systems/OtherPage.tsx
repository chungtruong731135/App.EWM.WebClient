import {Navigate, Route, Routes, Outlet} from 'react-router-dom';

import AuditsPage from './audits/AuditsPage';
import LoginLogsPage from "./loginlogs/LoginLogsPage";
import RolesPage from "./roles/RolesPage";
import AppConfigsPage from "./appconfigs/AppConfigsPage";
import EmailConfigsPage from "./emailconfig/EmailConfigsPage";

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path='audits' element={<AuditsPage />} />
        <Route path='loginlogs' element={<LoginLogsPage />} />
        <Route path='jobpositions' element={<AuditsPage />} />
        <Route path='roles' element={<RolesPage />} />
        <Route path='settings' element={<AppConfigsPage />} />
        <Route path='emailconfigs' element={<EmailConfigsPage />} />

        <Route path='*' element={<Navigate to='/error/404/system' />} />

        <Route index element={<Navigate to='/systems/company-info/overview' />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
