import CssBaseline from '@mui/material/CssBaseline';
import { Header, ThemeProvider, Router } from './components';

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <CssBaseline />
        <Header />
        <Router />
      </ThemeProvider>
    </div>
  );
};

export { App };
