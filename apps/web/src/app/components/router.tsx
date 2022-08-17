import { isLoggedIn, SignInPage } from '../../auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthRedirectPage } from '../../auth';
import { ArchivePage } from '../../archive';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={withLogout(<SignInPage />)} />
        <Route
          path="/oauth/redirect"
          element={withLogout(<OAuthRedirectPage />)}
        />
        <Route path="/archive" element={withLogin(<ArchivePage />)} />
        <Route path="/" element={<Index />} />
        <Route path="*" element={<>{'Not Found'}</>} />
      </Routes>
    </BrowserRouter>
  );
};

const Index = () => {
  return isLoggedIn ? navigate('/archive') : navigate('/sign-in');
};

/**
 * Renders the given element only if the user is logged in. Otherwise, navigates to "/sign-in" page
 * @param element Element to render
 */
const withLogin = (element: React.ReactNode): React.ReactNode => {
  return isLoggedIn ? element : navigate('/sign-in');
};

/**
 * Renders the given element only if the user is logged out. Otherwise, navigates to "/archive" page
 * @param element Element to render
 */
const withLogout = (element: React.ReactNode): React.ReactNode => {
  return isLoggedIn ? navigate('/archive') : element;
};

const navigate = (path: string) => <Navigate to={path} replace />;
