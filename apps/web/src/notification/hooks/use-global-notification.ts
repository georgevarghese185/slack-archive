import { useCallback, useContext } from 'react';
import { GlobalNotificationContext } from '../contexts';

export const useGlobalNotifications = () => {
  const { pushError } = useContext(GlobalNotificationContext);

  const pushErrorCb = useCallback((error: string | Error) => {
    pushError(error instanceof Error ? error.message : error);
  }, []);

  return { pushError: pushErrorCb };
};
