import CssBaseline from '@mui/material/CssBaseline';
import { Header, ThemeProvider, Router } from './components';
import { GlobalNotificationProvider } from '../notification';

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <CssBaseline />
        <GlobalNotificationProvider>
          <Header />
          <Router />
        </GlobalNotificationProvider>
      </ThemeProvider>
    </div>
  );
};

export { App };
