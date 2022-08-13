import { SignInPage } from '../../auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="*" element={<>{'Not Found'}</>} />
      </Routes>
    </BrowserRouter>
  );
};
