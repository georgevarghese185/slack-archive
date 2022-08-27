import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { login } from '../auth-service';
import { redirectTo } from '../../browser';

export const useLogin = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<Error | null>(null);

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (code && state) {
      login(code, state)
        .then(() => redirectTo('/'))
        .catch(setError);
    }
  }, [code, state]);

  return { error };
};
