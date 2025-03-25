import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import ActivationCodePage from './activation-code/ActivationCodePage';
import UserCoursesPage from './user-courses/UserCoursesPage';
import UserCoursesWaitActivePage from './user-courses/UserCoursesWaitActivePage';
import UserPapersPage from './userpapers/UserPapersPage';
import VietQRLogsPage from './vietqrlogs/VietQRLogsPage';
import InvoicesPage from './invoices/InvoicesPage';
import UserPapersAdvisedPage from './userpapers/UserPapersAdvisedPage ';
import UserCoursesActivePage from './user-courses/UserCoursesActivePage';

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="vietqrlogs" element={<VietQRLogsPage />} />
        <Route path="activationcodes" element={<ActivationCodePage />} />
        <Route path="usercourses" element={<UserCoursesPage />} />
        <Route path="wait-courses" element={<UserCoursesWaitActivePage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="userpapers" element={<UserPapersPage />} />
        <Route path="reply-userpapers" element={<UserPapersAdvisedPage />} />
        <Route path="active-courses" element={<UserCoursesActivePage />} />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/system/study/usercourses" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
