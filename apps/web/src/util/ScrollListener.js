/**
 * A class for listening to Scroll related events
 */
class ScrollListener {
  /**
   * Create a listener
   *
   * @param {Object} scrollContainer An HTML element that scrolls its inner contents
   */
  constructor (scrollContainer) {
    this.container = scrollContainer
  }

  /**
   * Check if a given child/descendent element of the container is scrolled into
   * view and is visible
   *
   * @param {Object} element An HTML element that is a child/descendent of the
   * scrolling container
   * @returns {boolean} true if the child is visible in the container's view,
   * false if it is hidden
   */
  inView (element) {
    const containerBoundingRect = this.container.getBoundingClientRect()
    const containerTop = containerBoundingRect.top
    const containerBottom = containerBoundingRect.bottom

    const elementBoundingRect = element.getBoundingClientRect()
    const elementTop = elementBoundingRect.top
    const elementBottom = elementBoundingRect.bottom

    return elementBottom > 0 &&
      elementTop < window.innerHeight &&
      elementBottom > containerTop &&
      elementTop < containerBottom
  }

  /**
   * Get a callback whenever a given child/descendent element is scrolled into view.
   *
   * @param {Object} element An HTML element that is a child/descendent of the
   * scrolling container
   * @param {function} callback A callback function that should be called when the
   * child/descendent element is scrolled into view
   * @return {function} A function to stop listening for scroll-into-view events
   */
  whenInView (element, callback) {
    if (window.IntersectionObserver) {
      // IntersectionObserver API is available. Use it for better performance

      const options = { root: this.container, threshold: 0.1 }
      const observer = new IntersectionObserver((e) => {
        if (e[0].isIntersecting) {
          callback()
        }
      }, options)

      observer.observe(element)

      return () => observer.disconnect()
    } else {
      // IntersectionObserver API is not supported in this browser. Use an onscroll
      // listener

      const check = () => {
        if (this.inView(element)) {
          callback()
        }
      }

      const onscroll = () => {
        // For better performance, debounce onscroll events for 500 ms
        this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(check, 500)
      }

      this.container.addEventListener('scroll', onscroll)

      // In case the element is already in view right now, run the first check now
      setTimeout(check, 0)

      return () => this.container.removeEventListener('scroll', onscroll)
    }
  }
}

export default ScrollListener
