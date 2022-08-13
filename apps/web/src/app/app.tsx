import CssBaseline from '@mui/material/CssBaseline';
import { Header } from './header';
import { ThemeProvider } from './theme-provider';
import { WelcomePage } from '../home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <CssBaseline />
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/sign-in" element={<WelcomePage />} />
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route path="*" element={<>{'Not Found'}</>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
};

export { App };
