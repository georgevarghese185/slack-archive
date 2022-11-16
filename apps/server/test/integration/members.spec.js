const axios = require('axios');
const { expect } = require('chai');
const { login } = require('./login/loginHelper');
const { startServer } = require('./util/server');

describe('Members', () => {
    let axiosInstance;
    let stopServer;

    before(async () => {
        stopServer = await startServer();
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    after(async () => {
        await stopServer();
    })

    it('all members should be backed up', async () => {
        const loginCookie = (await login()).loginCookie;
        const expectedMembers = require('../mockSlack/data/members.json').members;

        for (const expectedMember of expectedMembers) {
            const { data: member } = await axiosInstance.get(`/v1/members/${expectedMember.id}`);
            expect(member).to.deep.equal(expectedMember)
        }
    })

})