import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import BannersPage from './banners/BannersPage';
import PopupsPage from './popups/PopupsPage';
import LearningOnlinesPage from './learningonlines/LearningOnlinesPage';
import TeachersPage from './teachers/TeachersPage';
import DiscussionsPage from './discussions/DiscussionsPage';
import FeedbacksPage from './feedbacks/FeedbacksPage';
import DictionariesPage from './dictionaries/DictionariesPage';
import ParentsCommentsPage from './parents-comments/ParentsCommentsPage';
import ArticleCatalogsPage from './article-catalogs/ArticleCatalogsPage';
import ArticlesPage from './articles/ArticlesPage';
import UserPapersPage from './userpapers/UserPapersPage';
import NotificationsPage from './notifications/NotificationsPage';
import DictionaryWordsPage from './dictionarywords/DictionaryWordsPage';
import DictionaryTitlesPage from './dictionarytitles/DictionaryTitlesPage';
const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="learningonlines" element={<LearningOnlinesPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="popups" element={<PopupsPage />} />
        <Route path="discussions" element={<DiscussionsPage />} />
        <Route path="feedbacks" element={<FeedbacksPage />} />
        <Route path="dictionaries" element={<DictionariesPage />} />
        <Route path="dictionarywords" element={<DictionaryWordsPage />} />
        <Route path="dictionarytitles" element={<DictionaryTitlesPage />} />
        <Route path="parents-comments" element={<ParentsCommentsPage />} />
        <Route path="article-catalogs" element={<ArticleCatalogsPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="userpapers" element={<UserPapersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" />} />
        <Route index element={<Navigate to="/systems/company-info/overview" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
