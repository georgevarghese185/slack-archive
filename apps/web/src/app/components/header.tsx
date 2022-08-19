import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../../auth';
import { useLogout } from '../../auth/hooks/use-logout';
import './header.css';

export const Header = () => {
  return (
    <Box>
      <AppBar position="relative" sx={{ zIndex: 99 }}>
        <Toolbar style={{ height: 58, minHeight: 58 }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            <Link className="home-link" to="/">
              Slack Archive
            </Link>
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
