
/**
 * Internally handles rate limiting in Slack APIs so that the user doesn't have
 * to. It does this by adding a response interceptor to the given axios instance
 * which intercepts all 429 responses and retries after the suggested delay.
 *
 * @param {Object} axiosInstance - An axios instance object
 */
const withRateLimiting = (axiosInstance) => {
    axiosInstance.interceptors.response.use(null, async (error) => {
        if (error.response.status !== 429) {
            throw error;
        }

        const retryAfter = parseInt(error.response.headers['retry-after']);

        if (isNaN(retryAfter)) {
            throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

        return axiosInstance(error.config);
    });
}


module.exports = {
    withRateLimiting
}