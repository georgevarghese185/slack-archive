import { useCallback, useState } from 'react';
import { redirectTo } from '../../browser';
import { getAuthUrl } from '../auth';

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(() => {
    setLoading(true);
    setError(null);

    getAuthUrl()
      .then(url => {
        redirectTo(url);
      })
      .catch(e => {
        setLoading(false);
        setError(e);
      });
  }, []);

  return { signIn, loading, error };
};
