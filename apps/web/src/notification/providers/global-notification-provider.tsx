import { ReactNode, useEffect, useState } from 'react';
import { NotificationSnackbar } from '../components';
import { GlobalNotificationContext } from '../contexts';

export const GlobalNotificationProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (error) {
      setMessage(error);
      setOpen(true);
    }
  }, [error]);

  useEffect(() => {
    if (!open) {
      // reset when closed
      setError(null);
    }
  }, [open]);

  return (
    <GlobalNotificationContext.Provider value={{ error, pushError: setError }}>
      <NotificationSnackbar
        message={message}
        onClose={() => setOpen(false)}
        open={open}
      />
      {children}
    </GlobalNotificationContext.Provider>
  );
};
