import { List, ListItemButton } from '@mui/material';
import { useMessages } from '../hooks';
import { Message } from '../message';
import { MessageItem } from './message-item';

export const MessageHistory: React.FC<{ channelId: string }> = ({
  channelId,
}) => {
  const { messages } = useMessages(channelId);

  return (
    <List sx={{ marginTop: 'auto' }}>
      {messages &&
        messages.map(message => (
          <MessageListItem message={message} key={message.ts} />
        ))}
    </List>
  );
};

const MessageListItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <ListItemButton
      disableRipple
      sx={{ cursor: 'default', paddingY: 2 }}
      key={message.ts}
    >
      <MessageItem message={message} />
    </ListItemButton>
  );
};
