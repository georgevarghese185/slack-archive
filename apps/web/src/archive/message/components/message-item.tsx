import { Grid, Skeleton, Typography } from '@mui/material';
import { Message, getTime as getMessageTime } from '../message';

export const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs="auto">
        <Avatar message={message} />
      </Grid>
      <Grid item container xs spacing={1}>
        <Grid item>
          <Username message={message} />
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

const Avatar: React.FC<{ message: Message }> = () => {
  return <Skeleton variant="rounded" animation="wave" width={48} height={48} />;
};

const Username: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <Typography variant="body2" fontWeight="bold">
      {message.user}
    </Typography>
  );
};

const Time: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      {getMessageTime(message)}
    </Typography>
  );
};

const Content: React.FC<{ message: Message }> = ({ message }) => {
  return <Typography>{message.text}</Typography>;
};
