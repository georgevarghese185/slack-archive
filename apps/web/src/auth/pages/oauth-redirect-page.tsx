import { Typography } from '@mui/material';
import { SingleCardPage } from '../../common';
import { useLogin } from '../hooks';

export const OAuthRedirectPage = () => {
  useLogin();

  return (
    <SingleCardPage>
      <Typography
        variant="subtitle1"
        component="div"
        gutterBottom
        align="center"
      >
        Please wait...
      </Typography>
    </SingleCardPage>
  );
};
