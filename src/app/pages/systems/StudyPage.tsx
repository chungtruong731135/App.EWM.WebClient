import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';


import AllQuestionsPage from './allquestions/AllQuestionsPage';
import QuestionGroupsPage from './questionGroups/QuestionGroupsPage';

import TopicDetailModal from './topics/components/TopicDetailModal';
import QuestionLevelDetailModal from './questionlevels/components/QuestionLevelDetailModal';

const GeneralPage = () => {
  return (
    <>
      <Routes>
        <Route element={<Outlet />}>
          <Route path="questions" element={<AllQuestionsPage />} />
          <Route path="questiongroups" element={<QuestionGroupsPage />} />

          <Route path="*" element={<Navigate to="/error/404/system" />} />
          <Route index element={<Navigate to="/system/study/examinats" />} />
        </Route>
      </Routes>
      {createPortal(<TopicDetailModal />, document.body)}
      {createPortal(<QuestionLevelDetailModal />, document.body)}
    </>
  );
};

export default GeneralPage;
