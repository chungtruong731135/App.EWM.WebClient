import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import ReportRevenuePage from './reports/ReportRevenuePage';
import ReportPartnerPage from './reports/ReportPartnerPage';
import ReportInvoicesPage from './reports/ReportInvoicesPage';
import ReportExaminatsPage from './reports/ReportExaminatsPage';
import ReportCourseOnlinePage from './reports/ReportCourseOnlinePage';
import ReportNguonKhachHangsPage from './reports/ReportNguonKhachHangsPage';
import ReportDebtPage from './reports/ReportDebtPage';
import DoiSoatGiaoDichPage from './reports/DoiSoatGiaoDichPage';
import ThongKeGiaoDichTheoLoaiPage from './reports/ThongKeGiaoDichTheoLoaiPage';

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="revenue" element={<ReportRevenuePage />} />
        <Route path="partner" element={<ReportPartnerPage />} />
        <Route path="invoice" element={<ReportInvoicesPage />} />
        <Route path="examinats" element={<ReportExaminatsPage />} />
        <Route path="debt" element={<ReportDebtPage />} />
        <Route path="course-online" element={<ReportCourseOnlinePage />} />
        <Route path="nguon-khach-hang" element={<ReportNguonKhachHangsPage />} />
        <Route path="doi-soat-ctv" element={<DoiSoatGiaoDichPage />} />
        <Route path="thong-ke-theo-loai" element={<ThongKeGiaoDichTheoLoaiPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/system/reports/revenue" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
