import { PropsWithChildren, useRef } from 'react';
import { MemberContext } from '../contexts';
import { MemberStore } from '../member-store';

export const MemberProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const store = useRef(new MemberStore());

  return (
    <MemberContext.Provider value={{ store: store.current }}>
      {children}
    </MemberContext.Provider>
  );
};
