const axios = require('axios');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiSorted = require('chai-sorted');
const { login } = require('./login/loginHelper');

chai.use(deepEqualInAnyOrder);
chai.use(chaiSorted);
const expect = chai.expect;

const getMessages = async (axiosInstance, loginCookie, params) => {
    let messages = [];
    let lastTs;

    while (true) {
        const { data } = await axiosInstance.get('/v1/messages', {
            headers: { Cookie: loginCookie },
            params: { ...params, before: lastTs }
        });

        if (data.messages.length == 0) {
            break;
        }

        expect(messages).to.be.sortedBy('ts')

        messages = messages.concat(data.messages);
        lastTs = data.messages[0].ts;
    }

    return messages
}

describe('Messages', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}` });

    it('all messages should be backed up', async () => {
        const expectedMessages = require('../mockSlack/data/messages.json');
        const expectedReplies = require('../mockSlack/data/replies.json');
        const loginCookie = (await login()).loginCookie;

        for (const conversationId in expectedMessages) {
            let messages = await getMessages(axiosInstance, loginCookie, { conversationId, postsOnly: true });
            expect(messages).to.deep.equalInAnyOrder(expectedMessages[conversationId]);
        }

        for (const conversationId in expectedReplies) {
            for (const threadTs in expectedReplies[conversationId]) {
                let replies = await getMessages(axiosInstance, loginCookie, { conversationId, thread: threadTs });
                expect(replies).to.deep.equalInAnyOrder(expectedReplies[conversationId][threadTs]);
            }
        }
    }).timeout(20000);

})