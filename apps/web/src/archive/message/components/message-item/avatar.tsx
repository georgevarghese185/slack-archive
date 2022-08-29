import { Skeleton } from '@mui/material';
import { useMember } from '../../../member';
import { MessageProps } from './message-props';
import './avatar.css';

export const Avatar: React.FC<MessageProps> = ({ message }) => {
  const member = useMember(message?.user);

  return member ? (
    <img src={member.profile.image_48} className="avatar" />
  ) : (
    <Skeleton variant="rounded" animation="wave" width={48} height={48} />
  );
};
