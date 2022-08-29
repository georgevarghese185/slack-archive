import { useContext, useEffect, useState } from 'react';
import { Member } from '../member';
import { MemberContext } from '../contexts';

export const useMember = (id?: string) => {
  const { store: memberStore } = useContext(MemberContext);
  const [member, setMember] = useState<Member | null>(
    id ? memberStore.fromCache(id) : null
  );

  useEffect(() => {
    if (id && member?.id !== id) {
      memberStore.get(id).then(setMember);
    }
  }, [id]);

  return member;
};
