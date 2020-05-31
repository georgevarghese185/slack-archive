const axios = require('axios');
const { expect } = require('chai');
const { login } = require('../login/loginHelper');

describe('Backup', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` });
    let loginCookie = null;

    axiosInstance.interceptors.request.use((config) => {
        if (loginCookie != null) {
            config.headers.Cookie = loginCookie;
        }

        return config;
    });

    it('backup stats should be empty', async () => {
        loginCookie = (await login()).loginCookie;

        const { data: stats } = await axiosInstance.get('/v1/backup/stats');

        expect(stats).to.deep.equal({
            messages: 0,
            conversations: 0,
            lastBackupAt: null
        });
    })
})