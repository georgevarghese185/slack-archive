import { Button, Card, CardContent, Typography } from '@mui/material';
import { Box, Container } from '@mui/system';

export const WelcomePage = () => {
  return (
    <Container sx={{ marginTop: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ padding: 4 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <WelcomeTitle />
            <WelcomeSubtitle />
            <SignInButton />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

const WelcomeTitle = () => {
  return (
    <Typography
      variant="h3"
      component="div"
      gutterBottom
      align="center"
      sx={{ fontWeight: 'bold' }}
    >
      Welcome to Slack Archive
    </Typography>
  );
};

const WelcomeSubtitle = () => {
  return (
    <Typography variant="subtitle1" component="div" gutterBottom align="center">
      To begin, sign into your workspace and give Slack Archive access to read
      your public channels
    </Typography>
  );
};

const SignInButton = () => {
  return (
    <Button
      variant="contained"
      disableElevation
      size="large"
      sx={{ marginTop: 4 }}
    >
      Sign In
    </Button>
  );
};
