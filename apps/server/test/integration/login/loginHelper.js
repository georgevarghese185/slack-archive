const axios = require('axios');
const qs = require('query-string');

const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` })

// helper function for getting auth URL from slack archive (assumes Mock Slack server is being used)
const getAuthUrl = async () => {
    const response = await axiosInstance.get('/v1/login/auth-url');
    return {
        response,
        url: response.data.url,
        params: response.data.params
    }
}

// helper function for logging into slack archive (assumes Mock Slack server is being used)
const login = async () => {
    const { url, params } = await getAuthUrl();
    const { headers: { location } } = await axios.get(url, {
        params: {
            ...params,
            redirect_uri: process.env.OAUTH_REDIRECT_URI
        },
        validateStatus: (status) => status === 302,
        maxRedirects: 0
    });

    const { query: { code } } = qs.parseUrl(location);

    const response = await axiosInstance.post('/v1/login', { verificationCode: code });
    const loginCookie = response.headers['set-cookie'][0];

    return { response, loginCookie }
}

module.exports = {
    getAuthUrl,
    login
}