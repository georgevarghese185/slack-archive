import { createContext } from 'react';
import { ScrollListener } from '../scroll-listener';

export type ScrollContextState = {
  scrollListener?: ScrollListener;
};

export const ScrollContext = createContext<ScrollContextState>({});
