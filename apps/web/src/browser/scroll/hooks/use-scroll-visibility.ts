import { RefObject, useContext, useEffect } from 'react';
import { ScrollContext } from '../contexts';

/**
 * Used to know when an element inside a scrollable container is scrolled into
 * view and visible
 *
 * Must be used inside a heirarchy wrapped with `ScrollProvider` where
 * `ScrollProvider` is given a ref to the scrollable container inside which
 * this element sits
 *
 * @param elementRef element of interest within the scroll container
 * @param onVisible callback to trigger when the element is scrolled into view
 */
export const useScrollVisibility = (
  elementRef: RefObject<HTMLElement>,
  onVisible?: () => void
) => {
  const { scrollListener } = useContext(ScrollContext);

  useEffect(() => {
    const element = elementRef.current;

    if (onVisible && scrollListener && element) {
      if (scrollListener.inView(element)) {
        onVisible();
      }

      const disconnect = scrollListener.whenInView(element, onVisible);
      return disconnect;
    }
  });
};
