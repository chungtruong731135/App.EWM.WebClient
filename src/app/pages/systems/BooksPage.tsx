import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import BookListPage from './books/BookListPage';
import BookTypesPage from './booktypes/BookTypesPage';
import BookCatalogsPage from './bookcatalogs/BookCatalogsPage';
import BookGradesPage from './bookgrades/BookGradesPage';
import BookSubjectsPage from './booksubjects/BookSubjectsPage';
import BookTablesPage from './books/BookTablesPage';
import BookPagesList from './books/BookPagesList';
import BookAuthorsPage from './books/BookAuthorsPage';
import BookLecturersPage from './books/BookLecturersPage';
import BookQuestionsPage from './books/BookQuestionsPage';
import TypeGradesPage from './/booktypes/TypeGradesPage';

import AllQuestionsPage from './allquestions/AllQuestionsPage';

const GeneralPage = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route path="search/:bookId/tables" element={<BookTablesPage />} />
                <Route path="search/:bookId/tables/:tableId/questions" element={<BookQuestionsPage />} />
                <Route path="search/:bookId/pages" element={<BookPagesList />} />
                <Route path="search/:bookId/authors" element={<BookAuthorsPage />} />
                <Route path="search/:bookId/lecturers" element={<BookLecturersPage />} />
                <Route path="search/:bookId/questions" element={<BookQuestionsPage />} />
                <Route path="search" element={<BookListPage />} />

                <Route path="types" element={<BookTypesPage />} />
                <Route path="types/:typeId/grades" element={<TypeGradesPage />} />

                <Route path="catalogs" element={<BookCatalogsPage />} />
                <Route path="grades" element={<BookGradesPage />} />
                <Route path="subjects" element={<BookSubjectsPage />} />
                <Route path="all-questions" element={<AllQuestionsPage />} />

                <Route path="*" element={<Navigate to="/error/404/system" />} />
                <Route index element={<Navigate to="/systems/fix-data/questions" />} />
            </Route>
        </Routes>
    );
};

export default GeneralPage;