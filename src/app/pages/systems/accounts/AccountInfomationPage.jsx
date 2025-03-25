/* eslint-disable jsx-a11y/anchor-is-valid */
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AccountHeader from './AccountHeader';
import ProfileDetails from './components/ProfileDetails';
import UserCourses from './components/UserCourses';
import UserLoginLogs from './components/UserLoginLogs';

const UsersPage = () => {
  return (
    <>
      <Routes>
        <Route
          element={
            <>
              <AccountHeader />
              <Outlet />
            </>
          }
        >
          <Route
            path=":userId/overview"
            element={
              <>
                <ProfileDetails />
              </>
            }
          />
          <Route
            path=":userId/courses"
            element={
              <>
                <UserCourses />
              </>
            }
          />
          <Route
            path=":userId/loginlogs"
            element={
              <>
                <UserLoginLogs />
              </>
            }
          />

          <Route index element={<Navigate to="/system/dashboard" />} />
        </Route>
      </Routes>
    </>
  );
};

export default UsersPage;
