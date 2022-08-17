import { createContext } from 'react';

export type GlobalNotificationState = {
  error: string | null;
  pushError: (error: string) => void;
};

export const GlobalNotificationContext = createContext<GlobalNotificationState>(
  {
    error: null,
    pushError: () => {},
  }
);
