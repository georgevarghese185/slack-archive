const axios = require('axios');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const { login } = require('./login/loginHelper');

chai.use(deepEqualInAnyOrder);
const expect = chai.expect;

describe('Conversations', () => {
    let axiosInstance;

    before(async () => {
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    it('all conversations should be backed up', async () => {
        const expectedConversations = require('../mockSlack/data/conversations.json').conversations;

        const { data: { conversations } } = await axiosInstance.get('/v1/conversations');

        expect(conversations).to.deep.equalInAnyOrder(expectedConversations);
    });

})