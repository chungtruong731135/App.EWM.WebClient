import { Navigate, Route, Routes, Outlet } from "react-router-dom";

import SalesActivationCodePage from "./sales/activation-codes/SalesActivationCodePage";
import SalesCoursePage from "./sales/courses/SalesCoursePage";
import SalesCustomerPage from "./sales/customers/SalesCustomerPage";
import SalesHistoryActivePage from "./sales/histories/SalesHistoryActivePage";
import UserCoursesPage from "./sales/user-courses/UserCoursesPage";
import UserPapersAdvisedPage from "./userpapers/UserPapersAdvisedPage ";
import DashboardWrapper from "./sales/dashboard/DashboardWrapper";
const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="activationcodes" element={<SalesActivationCodePage />} />
        <Route path="courses" element={<SalesCoursePage />} />
        <Route path="users" element={<SalesCustomerPage />} />
        <Route path="histories" element={<SalesHistoryActivePage />} />
        <Route path="usercourses" element={<UserCoursesPage />} />
        <Route
          path="userpapers"
          element={<UserPapersAdvisedPage isSale={true} />}
        />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/system/sales/dashboard" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
