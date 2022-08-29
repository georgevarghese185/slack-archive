import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, Router } from './components';
import { GlobalNotificationProvider } from '../notification';
import { Box } from '@mui/system';
import { MemberProvider } from '../archive/member';

const App = () => {
  return (
    <Box height="100%" width="100%" display="flex" flexDirection="column">
      <ThemeProvider>
        <CssBaseline />
        <GlobalNotificationProvider>
          <MemberProvider>
            <Router />
          </MemberProvider>
        </GlobalNotificationProvider>
      </ThemeProvider>
    </Box>
  );
};

export { App };
