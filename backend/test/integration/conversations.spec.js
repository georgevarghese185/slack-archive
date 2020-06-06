const axios = require('axios');
const { expect } = require('chai');
const { login } = require('./login/loginHelper');

describe('Conversations', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` });

    it('all conversations should be backed up', async () => {
        const loginCookie = (await login()).loginCookie;
        const expectedConversations = require('../mockSlack/data/conversations.json').conversations;

        const { data: { conversations } } = await axiosInstance.get('/v1/conversations', {
            headers: { 'Cookie': loginCookie }
        });

        expect(conversations).to.deep.equal(expectedConversations);
    });

})