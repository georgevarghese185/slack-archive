const axios = require('axios');
const { expect } = require('chai');
const { login } = require('../login/loginHelper');

describe('Backup', async () => {
    let axiosInstance;

    before(async () => {
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    it('backup stats should be empty', async () => {
        const { data: stats } = await axiosInstance.get('/v1/backup/stats');

        expect(stats).to.deep.equal({
            messages: 0,
            conversations: 0,
            lastBackupAt: null
        });
    });

    it('run backup', async () => {
        const { data: { backupId } } = await axiosInstance.post('/v1/backup');

        expect(backupId).not.to.be.null;

        let backup;
        while(true) {
            const response = await axiosInstance.get(`/v1/backup/${backupId}`);
            backup = response.data;

            if (backup.status === 'COMPLETED' ||
                backup.status === 'CANCELED' ||
                backup.status === 'FAILED') {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        expect(backup.status).to.equal('COMPLETED');
    });

    it('backup APIs should fail without login', async () => {
        try {
            await axiosInstance.get('/v1/backup/stats', {
                headers: { Cookie: "" }
            });
        } catch (e) {
            expect(e.response.status).to.equal(401);
            return;
        }

        // TODO test other backup APIs without login

        throw new Error('Should have failed');
    });
})