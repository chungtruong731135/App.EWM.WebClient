import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { createPortal } from 'react-dom';

import CourseOnlinePage from './course-onlines/CourseOnlinePage';
import CourseClassesPage from './course-onlines/CourseClassesPage';
import ClassOnlinePage from './course-onlines-classes/ClassOnlinePage';
import ClassSessionsPage from './course-onlines-classes/ClassSessionsPage';
import CourseSessionsPage from './course-onlines-sessions/CourseSessionsPage';
import SessionAssignmentPage from './course-onlines-sessions/SessionAssignmentPage';
import ClassSessionTestPage from './classsessiontests/ClassSessionTestPage';
import ClassSessionTestsListPage from './classsessiontests/ClassSessionTestsListPage';
import ClassSessionTestStudentsPage from './classsessiontests/ClassSessionTestStudentsPage';
import ClassSessionTestDetailPage from './classsessiontests/ClassSessionTestDetailPage';
import CourseReviewsPage from './course-onlines/CourseOnlineReviewsPage';
import ClassStudentsPage from './course-onlines-classes/ClassStudentsPage';
import CourseExamReviewsPage from './course-onlines/CourseExamReviewsPage';

import CourseOnlineDetailModal from './course-onlines/components/CourseOnlineDetailModal';
import CourseOnlineClassDetailModal from './course-onlines-classes/components/CourseOnlineClassDetailModal';
import CourseOnlineSessionDetailModal from './course-onlines-sessions/components/CourseOnlineSessionDetailModal';
import CreateAutoCourseOnlineSessionModal from './course-onlines-sessions/components/CreateAutoCourseOnlineSessionModal';

const GeneralPage = () => {
  return (
    <>
      <Routes>
        <Route element={<Outlet />}>
          <Route path="courses" element={<CourseOnlinePage />} />
          <Route path="courses/:courseId/course-classes" element={<CourseClassesPage />} />
          <Route path="courses/:courseId/course-classes/*" element={<CourseClassRoute />} />

          <Route path="courses/:courseId/course-reviews" element={<CourseReviewsPage />} />
          <Route path="courses/:courseId/courseexamreviews" element={<CourseExamReviewsPage />} />

          {/* <Route path="courses/*" element={<CourseRoute />} /> */}
          <Route path="course-classes" element={<ClassOnlinePage />} />
          <Route path="course-classes/*" element={<CourseClassRoute />} />

          <Route path="class-sessions" element={<CourseSessionsPage />} />
          <Route path="class-sessions/*" element={<ClassSessionsRoute />} />

          <Route path="*" element={<Navigate to="/error/404/system" />} />
          <Route index element={<Navigate to="/system/course-online/courses" />} />
        </Route>
      </Routes>
      {createPortal(<CourseOnlineDetailModal />, document.body)}
      {createPortal(<CourseOnlineClassDetailModal />, document.body)}
      {createPortal(<CreateAutoCourseOnlineSessionModal />, document.body)}

      {createPortal(<CourseOnlineSessionDetailModal />, document.body)}
    </>
  );
};

const CourseClassRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path=":courseClassId/class-students" element={<ClassStudentsPage />} />
        <Route path=":courseClassId/class-sessions" element={<ClassSessionsPage />} />
        <Route path=":courseClassId/class-sessions/*" element={<ClassSessionsRoute />} />
      </Route>
    </Routes>
  );
};
const ClassSessionsRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path=":classSessionId/assignments" element={<SessionAssignmentPage />} />
        <Route path=":classSessionId/tests" element={<ClassSessionTestsListPage />} />
        <Route path=":classSessionId/tests/*" element={<TestRoute />} />
      </Route>
    </Routes>
  );
};
const TestRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="new" element={<ClassSessionTestPage />} />
        <Route path=":classSessionTestId" element={<ClassSessionTestPage />} />
        <Route path=":classSessionTestId/student-tests" element={<ClassSessionTestStudentsPage />} />
        <Route path=":classSessionTestId/student-tests/:studentTestId" element={<ClassSessionTestDetailPage />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
