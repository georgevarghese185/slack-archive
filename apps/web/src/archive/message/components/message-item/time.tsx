import { Typography } from '@mui/material';
import { TextSkeleton } from '../../../../common';
import { getTime as getMessageTime } from '../../message';
import { MessageProps } from './message-props';

export const Time: React.FC<MessageProps> = ({ message }) => {
  return message ? (
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      {getMessageTime(message)}
    </Typography>
  ) : (
    <TextSkeleton width={48} />
  );
};
