import { Navigate, Route, Routes, Outlet } from "react-router-dom";

import UsersPage from "./users/UsersPage";
import StudentsPage from "./users/StudentsPage";
import ParentsPage from "./users/ParentsPage";
import DistributorsPage from "./users/DistributorsPage";
import RetailersPage from "./users/RetailersPage";
import TeachersPage from "./users/TeachersPage ";
const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="students" element={<StudentsPage type={1} />} />
        <Route path="teachers" element={<TeachersPage type={3} />} />
        <Route path="parents" element={<ParentsPage type={2} />} />
        <Route
          path="retailers"
          element={<RetailersPage type={4} title={"Cộng tác viên"} />}
        />
        <Route
          path="distributors"
          element={<DistributorsPage type={5} title={"Đại lý"} />}
        />
        <Route
          path="others"
          element={<UsersPage type={0} title={"Người dùng hệ thống"} />}
        />

        <Route path="*" element={<Navigate to="/error/404/system" />} />

        <Route
          index
          element={<Navigate to="/systems/company-info/overview" />}
        />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
