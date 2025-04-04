import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { PageLink, PageTitle } from '../../../_metronic/layout/core';
import { Feeds } from './components/Feeds';
import { Lists } from './components/Lists';
import { Tables } from './components/Tables';

const widgetsBreadCrumbs: Array<PageLink> = [
  {
    title: 'Widgets',
    path: '/crafted/widgets/charts',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
];

const WidgetsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path="feeds"
          element={
            <>
              <PageTitle breadcrumbs={widgetsBreadCrumbs}>Feeds</PageTitle>
              <Feeds />
            </>
          }
        />
        <Route
          path="lists"
          element={
            <>
              <PageTitle breadcrumbs={widgetsBreadCrumbs}>Lists</PageTitle>
              <Lists />
            </>
          }
        />

        <Route
          path="tables"
          element={
            <>
              <PageTitle breadcrumbs={widgetsBreadCrumbs}>Tables</PageTitle>
              <Tables />
            </>
          }
        />

        <Route index element={<Navigate to="/crafted/widgets/lists" />} />
      </Route>
    </Routes>
  );
};

export default WidgetsPage;
