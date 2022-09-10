import { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from '../message';
import { getMessageHistory, MessageHistoryOptions } from '../message-service';

type LoadOperation = 'replace' | 'append' | 'prepend';

export const useMessages = (
  channelId: string,
  onChange?: (messages: Message[]) => void
) => {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNewer, setHasNewer] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const processing = useRef(false);

  const getMessages = useCallback(
    (options: MessageHistoryOptions, operation: LoadOperation) => {
      if (processing.current) {
        return;
      }
      processing.current = true;
      setLoading(true);

      if (operation === 'replace') {
        setMessages(null);
      }

      getMessageHistory(channelId, options)
        .then(newMessages => {
          if (operation === 'prepend') {
            onWhatever?.();
          }
          setMessages(messages =>
            combineMessages(messages || [], newMessages, operation)
          );
          setHasNewer(operation === 'append' && newMessages.length > 0);
          setHasOlder(!(operation === 'prepend'));
        })
        .catch(setError)
        .finally(() => {
          setLoading(false);
          processing.current = false;
        });
    },
    [channelId]
  );

  useEffect(() => {
    getMessages({}, 'replace');
  }, [getMessages]);

  const loadOlder = () => {
    console.log('load older');
    const oldestMessage = messages?.[0];

    if (!oldestMessage) {
      return;
    }

    getMessages({ before: oldestMessage.ts }, 'prepend');
  };

  return {
    messages,
    loading,
    error,
    hasNewer,
    hasOlder,
    loadOlder,
  };
};

const combineMessages = (
  currentMessages: Message[],
  newMessages: Message[],
  operation: LoadOperation
) => {
  switch (operation) {
    case 'prepend':
      return newMessages.concat(currentMessages);
    case 'replace':
      return newMessages;
    default:
      return currentMessages.concat(newMessages);
  }
};
