import { Typography, useMediaQuery } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { SingleCardPage } from '../../common';
import { useSignIn } from '../hooks';

export const SignInPage = () => {
  const { signIn, loading } = useSignIn();

  return (
    <SingleCardPage>
      <WelcomeTitle />
      <WelcomeSubtitle />
      <SignInButton onClick={signIn} loading={loading} />
    </SingleCardPage>
  );
};

const WelcomeTitle = () => {
  const isSmall = useMediaQuery('(min-width:640px');

  return (
    <Typography
      variant={isSmall ? 'h3' : 'h4'}
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

const SignInButton: React.FC<{ onClick?: () => void; loading?: boolean }> = ({
  onClick,
  loading,
}) => {
  return (
    <LoadingButton
      variant="contained"
      disableElevation
      size="large"
      sx={{ marginTop: 4 }}
      onClick={onClick}
      disabled={loading}
      loading={loading}
    >
      Sign In
    </LoadingButton>
  );
};
