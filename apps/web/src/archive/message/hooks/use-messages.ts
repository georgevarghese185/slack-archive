import { useEffect, useState } from 'react';
import { Message } from '../message';
import { getMessageHistory } from '../message-service';

export const useMessages = (channelId: string) => {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getMessageHistory(channelId)
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [channelId]);

  return {
    messages,
    loading,
    error,
  };
};
