/**
 * A class for listening to Scroll related events
 */
class ScrollListener {
  private container: HTMLElement;
  private timer = 0;

  constructor(private scrollContainer: HTMLElement) {
    this.container = scrollContainer;
  }

  inView(element: HTMLElement) {
    const containerBoundingRect = this.container.getBoundingClientRect();
    const containerTop = containerBoundingRect.top;
    const containerBottom = containerBoundingRect.bottom;

    const elementBoundingRect = element.getBoundingClientRect();
    const elementTop = elementBoundingRect.top;
    const elementBottom = elementBoundingRect.bottom;

    return (
      elementBottom > 0 &&
      elementTop < window.innerHeight &&
      elementBottom > containerTop &&
      elementTop < containerBottom
    );
  }

  whenInView(element: HTMLElement, callback: () => void) {
    if (window.IntersectionObserver) {
      // IntersectionObserver API is available. Use it for better performance

      const options = { root: this.container, threshold: 0.1 };
      const observer = new IntersectionObserver(e => {
        if (e[0].isIntersecting) {
          callback();
        }
      }, options);

      observer.observe(element);

      return () => observer.disconnect();
    } else {
      // IntersectionObserver API is not supported in this browser. Use an onscroll
      // listener

      const check = () => {
        if (this.inView(element)) {
          callback();
        }
      };

      const onscroll = () => {
        // For better performance, debounce onscroll events for 500 ms
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(check, 500) as unknown as number;
      };

      this.container.addEventListener('scroll', onscroll);

      // In case the element is already in view right now, run the first check now
      setTimeout(check, 0);

      return () => this.container.removeEventListener('scroll', onscroll);
    }
  }
}

export default ScrollListener;
