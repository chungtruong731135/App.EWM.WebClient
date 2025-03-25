import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import UsersPage from './UsersPage';
import OtherPage from './OtherPage';
import GeneralsPage from './GeneralsPage';
import StudyPage from './StudyPage';
import PortalPage from './PortalPage';
import CourseOnlinePage from './CourseOnlinePage';
import TeachersPage from './TeachersPage';

import DashboardWrapper from './dashboard/DashboardWrapper';
import RolesPage from './roles/RolesPage';
import ProfilePage from './profile/ProfilePage';
import SalesPage from './SalesPage';
import PaymentPage from './PaymentPage';
import ReportPage from './ReportPage';
import FixDataPage from './fix-data/FixDataPage';
import SupportsPage from './SupportsPage';
import BooksPage from './BooksPage';
import LeadsPage from './LeadsPage';
import CustomersPage from './CustomersPage';

import AccountInfomationPage from './accounts/AccountInfomationPage';

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
          path="payment/*"
          element={
            <>
              <PaymentPage />
            </>
          }
        />
        <Route
          path="reports/*"
          element={
            <>
              <ReportPage />
            </>
          }
        />
        <Route
          path="course-online/*"
          element={
            <>
              <CourseOnlinePage />
            </>
          }
        />
        <Route
          path="teachers/*"
          element={
            <>
              <TeachersPage />
            </>
          }
        />
        <Route
          path="portal/*"
          element={
            <>
              <PortalPage />
            </>
          }
        />
        <Route
          path="general/*"
          element={
            <>
              <GeneralsPage />
            </>
          }
        />
        <Route
          path="other/*"
          element={
            <>
              <OtherPage />
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
        <Route
          path="sales/*"
          element={
            <>
              <SalesPage />
            </>
          }
        />
        <Route
          path="fix-data/*"
          element={
            <>
              <FixDataPage />
            </>
          }
        />
        <Route
          path="supports/*"
          element={
            <>
              <SupportsPage />
            </>
          }
        />

        <Route
          path="book/*"
          element={
            <>
              <BooksPage />
            </>
          }
        />

        <Route
          path="leads/*"
          element={
            <>
              <LeadsPage />
            </>
          }
        />

        <Route
          path="customers/*"
          element={
            <>
              <CustomersPage />
            </>
          }
        />

        <Route
          path="account/*"
          element={
            <>
              <AccountInfomationPage />
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
