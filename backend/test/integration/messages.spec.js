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

        expect(data.messages).to.be.sortedBy('ts')

        messages = messages.concat(data.messages);
        lastTs = data.messages[0].ts;
    }

    return messages
}

const sortMessages = (message1, message2) => {
    if (message1.ts < message2.ts) {
        return -1;
    } else if (message1.ts > message2.ts) {
        return 1;
    } else {
        return 0;
    }
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
    });

    it('all replies should be backed up', async () => {
        for (const conversationId in mockReplies) {
            for (const threadTs in mockReplies[conversationId]) {
                let replies = await getMessages(axiosInstance, { conversationId, thread: threadTs });
                expect(replies).to.deep.equalInAnyOrder(mockReplies[conversationId][threadTs]);
            }
        }
    });

    it("get messages with 'from'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(0, 100);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, from: expectedMessages[0].ts }
        });

        expect(messages).to.deep.equal(expectedMessages);
    });

    it("get messages with 'after'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(0, 101);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, after: expectedMessages[0].ts }
        });

        expect(messages).to.deep.equal(expectedMessages.slice(1));
    });

    it("get messages with 'to'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-100);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, to: expectedMessages[99].ts }
        });

        expect(messages).to.deep.equal(expectedMessages);
    });

    it("get messages with 'before'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-101);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, before: expectedMessages[100].ts }
        });

        expect(messages).to.deep.equal(expectedMessages.slice(0, 100));
    });

    it("get messages with custom limit", async () => {
        const limit = 20;
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-limit);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, limit }
        });

        expect(messages).to.deep.equal(expectedMessages);
    })
})