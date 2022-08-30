import { useEffect, useState } from 'react';
import { Message } from '../message';
import { getMessageHistory } from '../message-service';

export const useMessages = (channelId: string) => {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNewer, setHasNewer] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);

  useEffect(() => {
    setLoading(true);

    getMessageHistory(channelId)
      .then(messages => {
        setMessages(messages);
        setHasNewer(false);
        setHasOlder(true);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [channelId]);

  return {
    messages,
    loading,
    error,
    hasNewer,
    hasOlder,
  };
};
