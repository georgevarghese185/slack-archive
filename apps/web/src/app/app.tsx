import CssBaseline from '@mui/material/CssBaseline';
import { Header } from './header';
import { ThemeProvider } from './theme-provider';
import { WelcomePage } from '../home';

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <CssBaseline />
        <Header />
        <WelcomePage />
      </ThemeProvider>
    </div>
  );
};

export { App };
