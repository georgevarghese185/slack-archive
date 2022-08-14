import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { isLoggedIn } from '../../auth';
import { useLogout } from '../../auth/hooks/use-logout';

export const Header = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar style={{ height: 58, minHeight: 58 }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Slack Archive
          </Typography>
          {isLoggedIn && <SignOutButton />}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const SignOutButton = () => {
  const { loading, logout } = useLogout();

  return (
    <Button color="inherit" onClick={logout} disabled={loading}>
      Sign Out
    </Button>
  );
};
