import { createContext } from 'react';
import { MemberStore } from '../member-store';

export type MemberState = {
  store: MemberStore;
};

export const MemberContext = createContext<MemberState>({
  store: new MemberStore(),
});
