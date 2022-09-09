import { useCallback, useEffect, useState } from 'react';
import { Message } from '../message';
import { getMessageHistory, MessageHistoryOptions } from '../message-service';

type LoadOperation = 'replace' | 'append' | 'prepend';

export const useMessages = (channelId: string) => {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNewer, setHasNewer] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);

  const getMessages = useCallback(
    (options: MessageHistoryOptions, operation: LoadOperation) => {
      setLoading(true);

      if (operation === 'replace') {
        setMessages(null);
      }

      getMessageHistory(channelId, options)
        .then(newMessages => {
          setMessages(combineMessages(messages || [], newMessages, operation));
          setHasNewer(operation === 'append' && newMessages.length > 0);
          setHasOlder(!(operation === 'prepend'));
        })
        .catch(setError)
        .finally(() => setLoading(false));
    },
    [channelId]
  );

  useEffect(() => {
    getMessages({}, 'replace');
  }, [getMessages]);

  const loadOlder = () => {
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
