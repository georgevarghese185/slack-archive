import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';

export const Header = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar style={{ height: 58, minHeight: 58 }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Slack Archive
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
