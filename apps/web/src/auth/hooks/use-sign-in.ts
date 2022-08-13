import { useCallback, useState } from 'react';
import { redirectTo } from '../../browser';
import { getAuthUrl } from '../sign-in';

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(() => {
    setLoading(true);
    getAuthUrl()
      .then(url => {
        redirectTo(url);
      })
      .catch(setError);
  }, []);

  return { signIn, loading, error };
};
