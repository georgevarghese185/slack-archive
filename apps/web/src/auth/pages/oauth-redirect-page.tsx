import { Typography } from '@mui/material';
import { SingleCardPage } from '../../common';

export const OAuthRedirectPage = () => {
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
