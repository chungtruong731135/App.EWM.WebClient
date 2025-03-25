import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import KhoaHocCungThayCoPage from './supports/KhoaHocCungThayCoPage';
import KhoaTuHocPage from './supports/KhoaTuHocPage';
import KhoaTuHocSapHetHanPage from './supports/KhoaTuHocSapHetHanPage';
import KhoaDungThuPage from './supports/KhoaDungThuPage';
import TruocKyThiPage from './supports/TruocKyThiPage';
import UserPapersPage from './userpapers/UserPapersPage';
import UserExamTestPapersPage from './userpapers/UserExamTestPapersPage';
import UserExamContestPapersPage from './userpapers/UserExamContestPapersPage';
import UserPapersAdvisedPage from './userpapers/UserPapersAdvisedPage ';
import UserCoursesWaitActivePage from './user-courses/UserCoursesWaitActivePage';
import TraCuuKhoaHocDangKyPage from './supports/TraCuuKhoaHocDangKyPage';

import SurveyTemplatesPage from './survey-templates/SurveyTemplatesPage';
import SurveyTemplateDetailsPage from './survey-templates/SurveyTemplateDetailsPage';
import SurveyTemplateUsersPage from './survey-templates/SurveyTemplateUsersPage';
import SurveyTemplateChartsPage from './survey-templates/SurveyTemplateChartsPage';
import SurveysPage from './surveys/SurveysPage';
import SurveyDetailsPage from './surveys/SurveyDetailsPage';

import ExamRegistrationsPage from './examregistrations/ExamRegistrationsPage';
import MessageCustomersPage from './messagecustomers/MessageCustomersPage';



const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="khoa-hoc-cung-thay-co" element={<KhoaHocCungThayCoPage />} />
        <Route path="dang-ky-hoc-thu" element={<KhoaDungThuPage />} />
        <Route path="khoa-tu-hoc" element={<KhoaTuHocPage />} />
        <Route path="khoa-sap-het-han" element={<KhoaTuHocSapHetHanPage />} />
        <Route path="truoc-ky-thi" element={<TruocKyThiPage />} />
        <Route path="userpapers" element={<UserPapersPage />} />
        <Route path="userexampapers" element={<UserExamTestPapersPage />} />
        <Route path="khach-hang-thi-thu" element={<UserExamContestPapersPage />} />
        <Route path="reply-userpapers" element={<UserPapersAdvisedPage />} />
        <Route path="wait-courses" element={<UserCoursesWaitActivePage />} />
        <Route path="tra-cuu-khoa-hoc" element={<TraCuuKhoaHocDangKyPage />} />

        <Route path="examregistrations" element={<ExamRegistrationsPage />} />

        <Route path="surveytemplates" element={<SurveyTemplatesPage />} />
        <Route path="surveytemplates/new" element={<SurveyTemplateDetailsPage />} />
        <Route path="surveytemplates/:surveyTemplateId" element={<SurveyTemplateDetailsPage />} />
        <Route path="surveytemplates/:surveyTemplateId/users" element={<SurveyTemplateUsersPage />} />
        <Route path="surveytemplates/:surveyTemplateId/chart" element={<SurveyTemplateChartsPage />} />
        <Route path="surveytemplates/:surveyTemplateId/surveys" element={<SurveysPage />} />
        <Route path="surveytemplates/:surveyTemplateId/surveys/new" element={<SurveyDetailsPage />} />
        <Route path="surveytemplates/:surveyTemplateId/surveys/:surveyId" element={<SurveyDetailsPage />} />

        <Route path="messagecustomers" element={<MessageCustomersPage />} />

        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/systems/fix-data/questions" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
