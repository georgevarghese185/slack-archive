import { Button, Typography, useMediaQuery } from '@mui/material';
import { SingleCardPage } from '../../common';
import { useSignIn } from '../hooks';

export const SignInPage = () => {
  const { signIn, loading } = useSignIn();

  const onSignInClick = async () => {
    signIn();
  };

  return (
    <SingleCardPage>
      <WelcomeTitle />
      <WelcomeSubtitle />
      <SignInButton onClick={onSignInClick} disabled={loading} />
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

const SignInButton: React.FC<{ onClick?: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => {
  return (
    <Button
      variant="contained"
      disableElevation
      size="large"
      sx={{ marginTop: 4 }}
      onClick={onClick}
      disabled={disabled}
    >
      Sign In
    </Button>
  );
};
