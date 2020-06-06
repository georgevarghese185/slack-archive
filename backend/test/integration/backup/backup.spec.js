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

    it('backup stats should fail without login', async () => {
        loginCookie = null;

        try {
            await axiosInstance.get('/v1/backup/stats');
        } catch (e) {
            expect(e.response.status).to.equal(401);
            return;
        }

        throw new Error('Should have failed');
    });

    it('run backup', async () => {
        loginCookie = (await login()).loginCookie;

        const { data: { backupId } } = await axiosInstance.post('/v1/backup');

        expect(backupId).not.to.be.null;

        let backup;
        let tries = 0;
        while(tries++ < 3) {
            const response = await axiosInstance.get(`/v1/backup/${backupId}`);
            backup = response.data;

            if (backup.status === 'COMPLETED' ||
                backup.status === 'CANCELLED' ||
                backup.status === 'FAILED') {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        expect(backup.status).to.equal('COMPLETED');
    }).timeout(5000);
})