const Conversations = require('../../src/models/Conversations');
const decache = require('decache');
const expect = require('chai').expect;
const Messages = require('../../src/models/Messages');
const Request = require('../../src/types/Request');

module.exports = () => {
    let api;

    before(() => {
        decache('../../src/api');
        decache('../../src/constants');
        api = require('../../src/api');
    });


    describe('GET:/v1/messages', () => {
        const messageList = [
            { ts: "1500000000.000001", threadTs: null,                  conversationId: "C1", json: { text: "1" } },
            { ts: "1500000000.000005", threadTs: null,                  conversationId: "C2", json: { text: "2" } },
            { ts: "1500000010.000000", threadTs: "1500000010.000000",   conversationId: "C2", json: { text: "3" } },
            { ts: "1500000020.000001", threadTs: null,                  conversationId: "C1", json: { text: "4" } },
            { ts: "1500000035.000001", threadTs: "1500000010.000000",   conversationId: "C2", json: { text: "5" } },
            { ts: "1500000040.000001", threadTs: "1500000010.000000",   conversationId: "C2", json: { text: "6" } },
            { ts: "1500000045.000001", threadTs: null,                  conversationId: "C3", json: { text: "7" } },
            { ts: "1500000050.000001", threadTs: null,                  conversationId: "C3", json: { text: "8" } },
            { ts: "1500000060.000001", threadTs: "1500000010.000000",   conversationId: "C2", json: { text: "9" } },
            { ts: "1500000100.000001", threadTs: null,                  conversationId: "C1", json: { text: "10" } }
        ];

        class MessagesMock extends Messages {
            get(from, to, conversationId, postsOnly, threadTs, limit) {
                let messages = messageList;

                const validateTimeArg = (x) => {
                    expect(x.inclusive).to.be.a('boolean');
                    expect(x.value).to.be.a('string');
                    expect(x.value).to.match(/\d+\.\d+/);
                }

                if(from) {
                    validateTimeArg(from);
                    messages = messages.filter(m => from.inclusive ? from.value <= m.ts : from.value < m.ts);
                }

                if (to) {
                    validateTimeArg(to);
                    messages = messages.filter(m => to.inclusive ? to.value >= m.ts : to.value > m.ts);
                }

                if(conversationId) {
                    messages = messages.filter(m => m.conversationId == conversationId);
                }


                if(postsOnly) {
                    messages = messages.filter(m => m.threadTs == null || m.threadTs === m.ts);
                }

                if(threadTs) {
                    messages = messages.filter(m => m.threadTs == threadTs);
                }

                if(limit) {
                    messages = messages.slice(0, limit);
                }

                return messages;
            }

            async threadExists(threadTs, conversationId) {
                if(conversationId) {
                    return messageList.find(m => m.threadTs == threadTs && m.conversationId == conversationId);
                } else {
                    return messageList.find(m => m.threadTs == threadTs);
                }
            }
        }

        class ConversationsMock extends Conversations {
            async exists(id) {
                return messageList.find(m => m.conversationId == id) != null;
            }
        }


        it('no parameters', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const response = await api['GET:/v1/messages'](new Request(), models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal(messageList.map(m => m.json));
        });


        it("'limit' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { limit: "6" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "1" },
                { text: "2" },
                { text: "3" },
                { text: "4" },
                { text: "5" },
                { text: "6" }
            ]);
        });


        it("'from' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { from: "1500000045.000001" }
            })

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "7" },
                { text: "8" },
                { text: "9" },
                { text: "10" }
            ]);
        });


        it("'to' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { to: "1500000020.000001" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "1" },
                { text: "2" },
                { text: "3" },
                { text: "4" }
            ]);
        });


        it("'after' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { after: "1500000045.000001" }
            })

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "8" },
                { text: "9" },
                { text: "10" }
            ]);
        });


        it("'before' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { before: "1500000020.000001" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "1" },
                { text: "2" },
                { text: "3" }
            ]);
        });


        it("'conversationId' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { conversationId: "C1" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "1" },
                { text: "4" },
                { text: "10" }
            ]);
        });


        it('postsOnly', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { postsOnly: 'true' }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "1" },
                { text: "2" },
                { text: "3" },
                { text: "4" },
                { text: "7" },
                { text: "8" },
                { text: "10" }
            ]);
        });


        it("'thread' parameter", async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { thread: "1500000010.000000" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(200);
            expect(response.body.messages).to.deep.equal([
                { text: "3" },
                { text: "5" },
                { text: "6" },
                { text: "9" }
            ]);
        });


        it('bad request: from+after/to+before', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };

            // from + after
            let request = new Request({
                query: { from: "1500000010.000000", after: "1500000010.000000" }
            });
            let response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');

            // to + before
            request = new Request({
                query: { to: "1500000010.000000", before: "1500000010.000000" }
            });
            response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');
        });


        it('bad request: Invalid Slack timestamp', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };

            test = async (query) => {
                let response = await api['GET:/v1/messages'](new Request({ query }), models);

                expect(response.status, `Incorrect status for ${JSON.stringify(query)}`).to.equal(400);
                expect(response.body.errorCode, `Incorrect error code for ${JSON.stringify(query)}`).to.equal('bad_request');
            }

            await test({ from: "1500000010" });
            await test({ to: "1500000010" });
            await test({ after: "1500000010" });
            await test({ before: "1500000010" });
            await test({ thread: "1500000010" });
        });


        it('bad request: invalid limit value', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };

            const testCases = [
                "",
                "10.01",
                "-8"
            ];

            for(const testCase of testCases) {
                const request = new Request({
                    query: { limit: testCase }
                });

                const response = await api['GET:/v1/messages'](request, models);

                expect(response.status, `Invalid status for ${JSON.stringify(testCase)}`).to.equal(400);
                expect(response.body.errorCode, `Invalid error code for ${testCase}`).to.deep.equal('bad_request');
            }
        })


        it('not found: unknown conversation ID', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };
            const request = new Request({
                query: { conversationId: "C10" }
            });

            const response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('conversation_not_found');
        });


        it('not found: unknown thread ts', async () => {
            const models = { messages: new MessagesMock(), conversations: new ConversationsMock() };


            // invalid ts
            let request = new Request({
                query: { thread: "1500000100.000001" }
            });

            let response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('thread_not_found');


            // valid ts but not in the given conversation
            request = new Request({
                query: { thread: "1500000010.000000", conversationId: "C3" }
            });

            response = await api['GET:/v1/messages'](request, models);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('thread_not_found');
        });
    });
}