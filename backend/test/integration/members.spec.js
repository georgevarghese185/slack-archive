const axios = require('axios');
const { expect } = require('chai');
const { login } = require('./login/loginHelper');

describe('Members', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` });

    it('all members should be backed up', async () => {
        const loginCookie = (await login()).loginCookie;
        const expectedMembers = require('../mockSlack/data/members.json').members;

        for (const expectedMember of expectedMembers) {
            const { data: member } = await axiosInstance.get(`/v1/members/${expectedMember.id}`, {
                headers: { 'Cookie': loginCookie }
            });
            expect(member).to.deep.equal(expectedMember)
        }
    })

})