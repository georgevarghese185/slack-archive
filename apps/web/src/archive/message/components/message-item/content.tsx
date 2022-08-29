import { Typography } from '@mui/material';
import { TextSkeleton } from '../../../../common';
import { MessageProps } from './message-props';

export const Content: React.FC<MessageProps> = ({ message }) => {
  return message ? (
    <Typography>{message.text}</Typography>
  ) : (
    <TextSkeleton width={300} />
  );
};
