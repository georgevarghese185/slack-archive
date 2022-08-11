import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  components: {
    MuiToolbar: {
      styleOverrides: {
        root: {
          // doesn't work for some reason. Need to override with `style` attribute
          height: 58,
          minHeight: 58,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: 58,
          minHeight: 58,
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#680763',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

export type ThemeProviderProps = {
  children?: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
