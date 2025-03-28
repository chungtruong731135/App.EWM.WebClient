import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import UsersPage from './UsersPage';
import StudyPage from './StudyPage';

import DashboardWrapper from './dashboard/DashboardWrapper';
import RolesPage from './roles/RolesPage';
import ProfilePage from './profile/ProfilePage';

// import AccountInfomationPage from './accounts/AccountInfomationPage';


const SystemsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="dashboard" element={<DashboardWrapper />} />

        <Route element={<Outlet />}>
          <Route
            path="users/*"
            element={
              <>
                <UsersPage />
              </>
            }
          />
        </Route>

        <Route
          path="roles"
          element={
            <>
              <RolesPage />
            </>
          }
        />
        <Route
          path="study/*"
          element={
            <>
              <StudyPage />
            </>
          }
        />
        <Route
          path="myprofile"
          element={
            <>
              <ProfilePage />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/error/404/system" />} />

        <Route index element={<Navigate to="/systems/dashboard" />} />
      </Route>
    </Routes>
  );
};

export default SystemsPage;
