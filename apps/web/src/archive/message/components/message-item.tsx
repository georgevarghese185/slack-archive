import { Grid, Skeleton, Typography } from '@mui/material';
import { Message, getTime as getMessageTime } from '../message';

export type MessageProps = { message?: Message };

export const MessageItem: React.FC<MessageProps> = ({ message }) => {
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

const Avatar: React.FC<MessageProps> = () => {
  return <Skeleton variant="rounded" animation="wave" width={48} height={48} />;
};

const Username: React.FC<MessageProps> = ({ message }) => {
  return message ? (
    <Typography variant="body2" fontWeight="bold">
      {message.user}
    </Typography>
  ) : (
    <TextSkeleton width={120} />
  );
};

const Time: React.FC<MessageProps> = ({ message }) => {
  return message ? (
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      {getMessageTime(message)}
    </Typography>
  ) : (
    <TextSkeleton width={48} />
  );
};

const Content: React.FC<MessageProps> = ({ message }) => {
  return message ? (
    <Typography>{message.text}</Typography>
  ) : (
    <TextSkeleton width={300} />
  );
};

const TextSkeleton: React.FC<{ width: number }> = ({ width }) => {
  return (
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ fontSize: '1rem', lineHeight: '1.25', maxWidth: '100%' }}
      width={width}
    />
  );
};
