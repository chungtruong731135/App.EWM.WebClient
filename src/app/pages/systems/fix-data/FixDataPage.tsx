import { Navigate, Route, Routes, Outlet } from "react-router-dom";

import QuestionsPage from "./questions/QuestionsPage";
import ExamsPage from "./exams/ExamsPage";

const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="exams" element={<ExamsPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/systems/fix-data/questions" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
