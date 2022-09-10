import { Box, List, ListItemButton } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { ScrollProvider, useScrollVisibility } from '../../../browser';
import { useMessages } from '../hooks';
import { Message } from '../message';
import { MessageItem } from './message-item';

export const MessageHistory: React.FC<{ channelId: string }> = ({
  channelId,
}) => {
  const { messages, loading, hasNewer, hasOlder, loadOlder } = useMessages(
    channelId,
    () => {
      bringToFocus.current = true;
    }
  );
  const bringToFocus = useRef(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bringToFocus.current) {
      bringToFocus.current = false;
      console.log('time to scroll');
      console.log(containerRef.current, focusRef.current);
      containerRef.current?.scrollTo({ top: focusRef?.current });
    }
  });

  useEffect(() => {
    // about to load brand new messages from a new channel
    setHistoryLoaded(false);
  }, [channelId]);

  useEffect(() => {
    // loading went from true to false which means new messages from a new
    // channel have finished loading and rendering. Scroll to bottom of page (newest messages are at the bottom)
    if (!historyLoaded && !loading) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
      });
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
      ref={containerRef}
    >
      <ScrollProvider scrollContainer={containerRef}>
        <List sx={{ marginTop: 'auto' }}>
          {loading && !messages && <MessageLoader n={20} />}

          {messages && (
            <Messages
              messages={messages}
              showOlderMessagesLoader={historyLoaded && hasOlder}
              showNewerMessagesLoader={historyLoaded && hasNewer}
              loadOlderMessages={loadOlder}
              loadNewerMessages={() => console.log('load newer')}
              focusRef={focusRef}
            />
          )}
        </List>
      </ScrollProvider>
    </Box>
  );
};

const Messages: React.FC<{
  messages: Message[];
  showOlderMessagesLoader: boolean;
  showNewerMessagesLoader: boolean;
  loadOlderMessages?: () => void;
  loadNewerMessages?: () => void;
  focusRef?: RefObject<HTMLDivElement>;
}> = ({
  messages,
  showOlderMessagesLoader,
  showNewerMessagesLoader,
  loadOlderMessages,
  loadNewerMessages,
  focusRef,
}) => {
  return (
    <>
      {showOlderMessagesLoader && (
        <MessageLoader n={5} onVisible={loadOlderMessages} />
      )}

      {messages.map(message => (
        <MessageListItem
          message={message}
          key={message.ts}
          {...(message.ts === '1657023454.000000'
            ? { focusRef: focusRef }
            : {})}
        />
      ))}

      {showNewerMessagesLoader && (
        <MessageLoader n={5} onVisible={loadNewerMessages} />
      )}
    </>
  );
};

const MessageLoader: React.FC<{ n: number; onVisible?: () => void }> = ({
  n,
  onVisible,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollVisibility(ref, onVisible);

  return (
    <div ref={ref}>
      {new Array(n).fill(null).map((_, idx) => (
        <MessageListItem key={idx} />
      ))}
    </div>
  );
};

const MessageListItem: React.FC<{
  message?: Message;
  focusRef?: RefObject<HTMLDivElement>;
}> = ({ message, focusRef }) => {
  return (
    <ListItemButton
      disableRipple
      sx={{ cursor: 'default', paddingY: 2 }}
      key={message?.ts}
      ref={focusRef}
    >
      <MessageItem message={message} />
    </ListItemButton>
  );
};
