import { useEffect, useState } from 'react';
import { Channel } from '../channel';
import { getChannels } from '../channel-service';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getChannels()
      .then(channels => {
        setLoading(false);
        setChannels(channels);
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  }, []);

  return { channels, loading, error };
};
