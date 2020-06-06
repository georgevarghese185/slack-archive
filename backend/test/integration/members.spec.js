const axios = require('axios');
const { expect } = require('chai');
const { login } = require('./login/loginHelper');

describe('Members', () => {
    let axiosInstance;

    before(async () => {
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    it('all members should be backed up', async () => {
        const loginCookie = (await login()).loginCookie;
        const expectedMembers = require('../mockSlack/data/members.json').members;

        for (const expectedMember of expectedMembers) {
            const { data: member } = await axiosInstance.get(`/v1/members/${expectedMember.id}`);
            expect(member).to.deep.equal(expectedMember)
        }
    })

})