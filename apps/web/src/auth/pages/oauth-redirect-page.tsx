import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { SingleCardPage } from '../../common';
import { useGlobalNotifications } from '../../notification';
import { useLogin } from '../hooks';

export const OAuthRedirectPage = () => {
  const { error } = useLogin();
  const { pushError } = useGlobalNotifications();

  useEffect(() => {
    if (error) {
      pushError(error);
    }
  }, [error]);

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
