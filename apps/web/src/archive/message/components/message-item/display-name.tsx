import { Typography } from '@mui/material';
import { TextSkeleton } from '../../../../common';
import { useMember } from '../../../member';
import { MessageProps } from './message-props';

export const DisplayName: React.FC<MessageProps> = ({ message }) => {
  const member = useMember(message?.user);

  return member ? (
    <Typography variant="body2" fontWeight="bold">
      {member.profile.display_name}
    </Typography>
  ) : (
    <TextSkeleton width={120} />
  );
};
