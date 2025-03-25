import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import LeadsPage from './sales/leads/LeadsPage';
import YeuCauTuVanPage from './sales/leads/YeuCauTuVanPage';

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="khach-hang-tiem-nang" element={<LeadsPage />} />
        <Route path="yeu-cau-tu-van" element={<YeuCauTuVanPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/systems/fix-data/questions" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
