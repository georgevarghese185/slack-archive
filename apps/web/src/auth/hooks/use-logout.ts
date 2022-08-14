import { useCallback, useState } from 'react';
import { logout } from '../../auth';
import { reloadRoot } from '../../browser';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);

  const logoutCallback = useCallback(async () => {
    setLoading(true);

    try {
      await logout();
    } catch (e) {
      console.warn(`Error while logging out. Logging out anyway...`, e);
    }

    reloadRoot();
  }, []);

  return { logout: logoutCallback, loading };
};
