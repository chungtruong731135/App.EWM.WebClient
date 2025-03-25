import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

import LocationsPage from './locations/LocationsPage';
import CategoryGroupsPage from './category-groups/CategoryGroupsPage';
import CategoriesPage from './categories/CategoriesPage';
import BanksPage from './banks/BanksPage';
import PromotionsPage from './promotions/PromotionsPage';
import SurveyQuestionsPage from './survey-questions/SurveyQuestionsPage';
const GeneralPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="locations" element={<LocationsPage />} />
        <Route path="category-groups" element={<CategoryGroupsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="banks" element={<BanksPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="surveyquestions" element={<SurveyQuestionsPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" />} />

        <Route index element={<Navigate to="/systems/company-info/overview" />} />
      </Route>
    </Routes>
  );
};

export default GeneralPage;
