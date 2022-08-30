import { Box, List, ListItemButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useMessages } from '../hooks';
import { Message } from '../message';
import { MessageItem } from './message-item';

export const MessageHistory: React.FC<{ channelId: string }> = ({
  channelId,
}) => {
  const { messages, loading } = useMessages(channelId);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // about to load brand new messages from a new channel
    setHistoryLoaded(false);
  }, [channelId]);

  useEffect(() => {
    // loading went from true to false which means new messages from a new
    // channel have finished loading and rendering. Scroll to bottom of page (newest messages are at the bottom)
    if (!historyLoaded && !loading) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      setHistoryLoaded(true);
    }
  }, [historyLoaded, loading]);

  return (
    <Box
      sx={{ backgroundColor: 'white' }}
      overflow="auto"
      height="100%"
      display="flex"
      flexDirection="column"
      ref={listRef}
    >
      <List sx={{ marginTop: 'auto' }}>
        {!loading &&
          messages &&
          messages.map(message => (
            <MessageListItem message={message} key={message.ts} />
          ))}
        {loading &&
          new Array(20)
            .fill(null)
            .map((_, idx) => <MessageListItem key={idx} />)}
      </List>
    </Box>
  );
};

const MessageListItem: React.FC<{ message?: Message }> = ({ message }) => {
  return (
    <ListItemButton
      disableRipple
      sx={{ cursor: 'default', paddingY: 2 }}
      key={message?.ts}
    >
      <MessageItem message={message} />
    </ListItemButton>
  );
};
