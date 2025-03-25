import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';

import ExaminatPage from './examinats/ExaminatPage';
import ExamAreasPage from './examareas/ExamAreasPage';
import PapersPage from './papers/PapersPage';

import ExamsPage from './exams/ExamsPage';
import ExamDetailPage from './exams/ExamDetailPage';
import ExamResultPage from './exams/ExamResultPage';

import CoursePage from './courses/CoursePage';
import CourseTopicsPage from './courses/CourseTopicsPage';
import CourseRoadMapPage from './courses/CourseRoadMapPage';
import CourseExamReviewsPage from './courses/CourseExamReviewsPage';
import CourseRoadMapItemsPage from './courses/CourseRoadMapItemsPage';

import TopicsPage from './topics/TopicsPage';
import TopicsQuestionLevelPage from './topics/TopicsQuestionLevelPage';

import QuestionsPage from './questions/QuestionsPage';
import QuestionGroupsPage from './questionGroups/QuestionGroupsPage';

import QuestionLevelsPage from './questionlevels/QuestionLevelsPage';
import QuestionLevelsListQuestionPage from './questionlevels/QuestionLevelsListQuestionPage';
import QuestionLevelsListExamPage from './questionlevels/QuestionLevelsListExamPage';
import QuestionLevelItemsPage from './questionlevelItems/QuestionLevelItemsPage';
import QuestionLevelItemsQuestionPage from './questionlevelItems/QuestionLevelItemsQuestionPage';

import ActivationCodePage from './activation-code/ActivationCodePage';
import UserCoursesPage from './user-courses/UserCoursesPage';
import UserCoursesWaitActivePage from './user-courses/UserCoursesWaitActivePage';
import UserPapersPage from './userpapers/UserPapersPage';
import VietQRLogsPage from './vietqrlogs/VietQRLogsPage';
import CourseReviewsPage from './course-onlines/CourseReviewsPage';

import CourseDetailModal from './courses/components/CourseDetailModal';
import TopicDetailModal from './topics/components/TopicDetailModal';
import QuestionLevelDetailModal from './questionlevels/components/QuestionLevelDetailModal';

import ContestNotificationsPage from './contest-notifications/ContestNotificationsPage';
import ContestsPage from './contests/ContestsPage';
import ContestExamsPage from './contests/ContestExamsPage';
import UserExamsPage from './contests/UserExamsPage';
import UserExamDetailsPage from './contests/UserExamDetailsPage';

import ToolHoTroPage from './toolshotro/ToolHoTroPage';

const GeneralPage = () => {
  return (
    <>
      <Routes>
        <Route element={<Outlet />}>
          <Route path="examinats" element={<ExaminatPage />} />
          <Route path="tool-ho-tro-lay-goi-y" element={<ToolHoTroPage />} />

          <Route path="courses" element={<CoursePage />} />
          <Route path="courses/:courseId/topics" element={<CourseTopicsPage />} />
          <Route path="courses/:courseId/topics/*" element={<TopicRoute />} />

          <Route path="courses/:courseId/roadmaps" element={<CourseRoadMapPage />} />
          <Route path="courses/:courseId/roadmaps/:learningRoadmapId/roadmapitems" element={<CourseRoadMapItemsPage />} />
          <Route path="courses/:courseId/courseexamreviews" element={<CourseExamReviewsPage />} />
          <Route path="courses/:courseId/reviews" element={<CourseReviewsPage />} />

          <Route path="topics" element={<TopicsPage />} />
          <Route path="topics/*" element={<TopicRoute />} />

          <Route path="questionlevels" element={<QuestionLevelsPage />} />
          <Route path="questionlevels/*" element={<QuestionLevelsRoute />} />

          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questiongroups" element={<QuestionGroupsPage />} />
          <Route path="examareas" element={<ExamAreasPage />} />
          <Route path="papers" element={<PapersPage />} />

          <Route path="exams" element={<ExamsPage />} />
          <Route path="exams/:examId" element={<ExamDetailPage />} />
          <Route path="exams/result" element={<ExamResultPage />} />

          <Route path="contestnotifications" element={<ContestNotificationsPage />} />
          <Route path="contests" element={<ContestsPage />} />
          <Route path="contests/:contestId/exams" element={<ContestExamsPage />} />
          <Route path="contests/:contestId/userexams" element={<UserExamsPage />} />
          <Route path="contests/:contestId/userexams/:userExamId" element={<UserExamDetailsPage />} />

          <Route path="activationcodes" element={<ActivationCodePage />} />
          <Route path="usercourses" element={<UserCoursesPage />} />
          <Route path="wait-courses" element={<UserCoursesWaitActivePage />} />
          <Route path="userpapers" element={<UserPapersPage />} />
          <Route path="vietqrlogs" element={<VietQRLogsPage />} />
          <Route path="*" element={<Navigate to="/error/404/system" />} />
          <Route index element={<Navigate to="/system/study/examinats" />} />
        </Route>
      </Routes>
      {createPortal(<CourseDetailModal />, document.body)}
      {createPortal(<TopicDetailModal />, document.body)}
      {createPortal(<QuestionLevelDetailModal />, document.body)}
    </>
  );
};

const TopicRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path=":topicId/questionlevels" element={<TopicsQuestionLevelPage />} />
        <Route path=":topicId/questionlevels/*" element={<QuestionLevelsRoute />} />
      </Route>
    </Routes>
  );
};
const QuestionLevelsRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path=":questionLevelId/questions" element={<QuestionLevelsListQuestionPage />} />
        <Route path=":questionLevelId/exams" element={<QuestionLevelsListExamPage />} />
        <Route path=":questionLevelId/questionlevelItems" element={<QuestionLevelItemsPage />} />
        <Route path=":questionLevelId/questionlevelItems/:questionLevelItemId/questionOrders" element={<QuestionLevelItemsQuestionPage />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
