import { Grid } from '@mui/material';
import { Avatar } from './avatar';
import { Content } from './content';
import { DisplayName } from './display-name';
import { MessageProps } from './message-props';
import { Time } from './time';

export const MessageItem: React.FC<MessageProps> = ({ message }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs="auto">
        <Avatar message={message} />
      </Grid>
      <Grid item container xs spacing={1}>
        <Grid item>
          <DisplayName message={message} />
        </Grid>
        <Grid item>
          <Time message={message} />
        </Grid>
        <Grid item xs={12}>
          <Content message={message} />
        </Grid>
      </Grid>
    </Grid>
  );
};
