
/**
 * Waits until an axios request is captured by moxios and returns that request.
 * If multiple axios requests have been captured, it returns the first
 * one. Calling it again after that will return the second request and so on.
 *
 * @param {Object} moxios moxios object
 * @returns {Request} The next request
 */
const nextRequest = async (moxios) => {
    const tick = () => new Promise((resolve) => moxios.wait(resolve));

    while (true) {
        await tick();
        const request = moxios.requests.first();

        if (request) {
            moxios.requests.remove(request.config.method, request.config.url);
            return request;
        }
    }
};

module.exports = {
    nextRequest
}