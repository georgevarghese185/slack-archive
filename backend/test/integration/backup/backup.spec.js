const axios = require('axios');
const { expect } = require('chai');
const { login } = require('../login/loginHelper');

describe('Backup', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` })

    it('backup stats should be empty', async () => {
        const { loginCookie } = await login();

        const { data: stats } = await axiosInstance.get('/v1/backup/stats', {
            headers: { 'Cookie': loginCookie }
        });

        expect(stats).to.deep.equal({
            messages: 0,
            conversations: 0,
            lastBackupAt: null
        });
    })
})