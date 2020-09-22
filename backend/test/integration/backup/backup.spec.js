const axios = require('axios');
const { expect } = require('chai');
const { login } = require('../login/loginHelper');
const { startServer } = require('../util/server');

describe('Backup', async () => {
    let axiosInstance;
    let stopServer;

    before(async () => {
        stopServer = await startServer()
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    after(async () => {
        await stopServer();
    })

    it('backup stats should be empty', async () => {
        const { data: stats } = await axiosInstance.get('/v1/backups/stats');

        expect(stats, 'Database is not empty. Run `npm run clearDb` to clear it').to.deep.equal({
            messages: 0,
            conversations: 0,
            lastBackupAt: null
        });
    });

    it('run backup', async () => {
        const { data: { backupId } } = await axiosInstance.post('/v1/backups/new');

        expect(backupId).not.to.be.null;

        let backup;
        while(true) {
            const response = await axiosInstance.get(`/v1/backups/${backupId}`);
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

    it('cancel a running backup', async () => {
        const { data: { backupId } } = await axiosInstance.post('/v1/backups/new');
        const response = await axiosInstance.post(`/v1/backups/${backupId}/cancel`);
        expect(response.status).to.equal(200);

        await new Promise(resolve => setTimeout(resolve, 300));

        const { data: { status } } = await axiosInstance.get(`/v1/backups/${backupId}`)
        expect(status).to.equal('CANCELED');
    });

    it('running 2 backups simultaneously should be prevented', async () => {
        const { data: { backupId } } = await axiosInstance.post('/v1/backups/new');

        const response = await axiosInstance.post('/v1/backups/new', {}, {
            validateStatus: () => true
        });

        await axiosInstance.post(`/v1/backups/${backupId}/cancel`);
        await new Promise(resolve => setTimeout(resolve, 300));

        expect(response.status).to.equal(409);
    });

    it('get a running backup', async () => {
        const { data: { backupId } } = await axiosInstance.post('/v1/backups/new');
        const response = await axiosInstance.get('/v1/backups/running');
        await axiosInstance.post(`/v1/backups/${backupId}/cancel`);
        await new Promise(resolve => setTimeout(resolve, 300));

        expect(response.data.running).to.have.length(1);
        expect(response.data.running[0].id).to.equal(backupId);
    })

    it('backup APIs should fail without login', async () => {
        try {
            await axiosInstance.get('/v1/backups/stats', {
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