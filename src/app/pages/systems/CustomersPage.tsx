import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import DanhSachKhachHangPage from './sales/customers/DanhSachKhachHangPage';

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="danh-sach-khach-hang" element={<DanhSachKhachHangPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/system/sales/dashboard" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
