import CssBaseline from '@mui/material/CssBaseline';
import { Header, ThemeProvider, Router } from './components';
import { GlobalNotificationProvider } from '../notification';
import { Box } from '@mui/system';

const App = () => {
  return (
    <Box height="100%" width="100%" display="flex" flexDirection="column">
      <ThemeProvider>
        <CssBaseline />
        <GlobalNotificationProvider>
          <Header />
          <Router />
        </GlobalNotificationProvider>
      </ThemeProvider>
    </Box>
  );
};

export { App };
