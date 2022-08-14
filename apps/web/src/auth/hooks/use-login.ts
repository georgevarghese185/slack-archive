import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { login } from '../sign-in';

export const useLogin = () => {
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (code && state) {
      login(code, state);
    }
  }, [code, state]);
};
