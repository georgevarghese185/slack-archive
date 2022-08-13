import { SignInPage } from '../../auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthRedirectPage } from '../../auth';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/oauth/redirect" element={<OAuthRedirectPage />} />
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="*" element={<>{'Not Found'}</>} />
      </Routes>
    </BrowserRouter>
  );
};
