import React, { PropsWithChildren, RefObject, useEffect, useRef } from 'react';
import { ScrollContext } from '../contexts/scroll-context';
import { ScrollListener } from '../scroll-listener';

export type ScrollProviderProps = {
  scrollContainer?: RefObject<HTMLElement>;
} & PropsWithChildren;

export const ScrollProvider: React.FC<ScrollProviderProps> = ({
  children,
  scrollContainer,
}) => {
  const scrollListenerRef = useRef<ScrollListener>();

  useEffect(() => {
    if (
      scrollContainer?.current &&
      scrollContainer?.current !== scrollListenerRef.current?.container
    ) {
      scrollListenerRef.current = new ScrollListener(scrollContainer.current);
    }
  });

  return (
    <ScrollContext.Provider
      value={{ scrollListener: scrollListenerRef.current || undefined }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
