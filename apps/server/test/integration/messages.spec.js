const axios = require('axios');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const chaiSorted = require('chai-sorted');
const { login } = require('./login/loginHelper');
const mockMessages = require('../mockSlack/data/messages.json');
const mockReplies = require('../mockSlack/data/replies.json');
const { startServer } = require('./util/server');

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
    let stopServer;
    let axiosInstance;
    const N = 100;      // limit used in testing `from`, `to`, `after`, `before` parameters in GET:/v1/messages
    const LIMIT = 20;   // limit used in testing the `limit` parameter GET:/v1/messages

    before(async () => {
        stopServer = await startServer();
        const smallestConversation = Object.keys(mockMessages)
            .map(id => ({ id, messages: mockMessages[id] }))
            .sort((c1, c2) => c1.messages.length - c2.messages.length)[0]
        const minimumRequired = Math.min(N, LIMIT)
        if (smallestConversation.messages.length <= minimumRequired) {
            throw new Error(
                `Some tests require at least ${minimumRequired + 1} mock messages to be present in each conversation: ` +
                `Found ${smallestConversation.messages.length} messages in conversation ${smallestConversation.id}`
            )
        }

        const loginCookie = (await login()).loginCookie;
        axiosInstance = axios.create({
            baseURL: `http://localhost:${process.env.PORT}`,
            headers: { Cookie: loginCookie }
        });
    });

    after(async () => {
        await stopServer();
    })

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
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(0, N);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, limit: N.toString(), postsOnly: true, from: expectedMessages[0].ts }
        });

        expect(messages).to.deep.equal(expectedMessages);
    });

    it("get messages with 'after'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(0, N + 1);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, limit: N.toString(), postsOnly: true, after: expectedMessages[0].ts }
        });

        expect(messages).to.deep.equal(expectedMessages.slice(1));
    });

    it("get messages with 'to'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-N);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, limit: N.toString(), postsOnly: true, to: expectedMessages[N - 1].ts }
        });

        expect(messages).to.deep.equal(expectedMessages);
    });

    it("get messages with 'before'", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-(N + 1));

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, limit: N.toString(), postsOnly: true, before: expectedMessages[N].ts }
        });

        expect(messages).to.deep.equal(expectedMessages.slice(0, N));
    });

    it("get messages with custom limit", async () => {
        const conversationId = Object.keys(mockMessages)[0];
        const expectedMessages = Array.from(mockMessages[conversationId]).sort(sortMessages).slice(-LIMIT);

        const { data: { messages: messages } } = await axiosInstance.get('/v1/messages', {
            params: { conversationId, postsOnly: true, limit: LIMIT }
        });

        expect(messages).to.deep.equal(expectedMessages);
    })
})