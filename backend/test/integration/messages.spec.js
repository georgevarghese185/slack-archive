const axios = require('axios');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiSorted = require('chai-sorted');
const { login } = require('./login/loginHelper');
const mockMessages = require('../mockSlack/data/messages.json');
const mockReplies = require('../mockSlack/data/replies.json');

chai.use(deepEqualInAnyOrder);
chai.use(chaiSorted);
const expect = chai.expect;

const getMessages = async (axiosInstance, params) => {
    let messages = [];
    let lastTs;

    while (true) {
        const { data } = await axiosInstance.get('/v1/messages', {
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
    let axiosInstance;

    before(async () => {
        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    it('all posts should be backed up', async () => {
        for (const conversationId in mockMessages) {
            let messages = await getMessages(axiosInstance, { conversationId, postsOnly: true });
            expect(messages).to.deep.equalInAnyOrder(mockMessages[conversationId]);
        }
    }).timeout(20000);

    it('all replies should be backed up', async () => {
        for (const conversationId in mockReplies) {
            for (const threadTs in mockReplies[conversationId]) {
                let replies = await getMessages(axiosInstance, { conversationId, thread: threadTs });
                expect(replies).to.deep.equalInAnyOrder(mockReplies[conversationId][threadTs]);
            }
        }
    }).timeout(20000);

})