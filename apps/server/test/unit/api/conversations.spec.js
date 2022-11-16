const api = require('../../../src/api');
const AppContext = require('../../../src/AppContext')
const { Conversations } = require('@slack-archive/common');
const expect = require('chai').expect;
const Request = require('../../../src/types/Request');

describe('Conversation APIs', () => {
    describe('GET:/v1/conversations', () => {
        it('list all conversations', async () => {
            const conversationList = [
                { id: 'C1', name: 'general' },
                { id: 'C2', name: 'random' }
            ];

            class ConversationsMock extends Conversations {
                async listAll() {
                    return conversationList
                }
            }
            const conversations = new ConversationsMock();
            const context = new AppContext()
                .setModels({ conversations });

            const response = await api['GET:/v1/conversations'](context);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ conversations: conversationList });
        });
    });

    describe('GET:/v1/conversations/:id', () => {
        it('get conversation info', async () => {
            const conversationId = 'C1';
            const conversationObj = {};
            const request = new Request({
                parameters: { id: conversationId }
            });

            class ConversationsMock extends Conversations {
                async get(id) {
                    expect(id).to.equal(conversationId);
                    return conversationObj;
                }
            }
            const conversations = new ConversationsMock();
            const context = new AppContext()
                .setModels({ conversations });

            const response = await api['GET:/v1/conversations/:id'](context, request);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(conversationObj);
        });

        it('not found: unknown conversation ID', async () => {
            const request = new Request({
                parameters: { id: 'C1' }
            });
            class ConversationsMock extends Conversations {
                async get(id) {
                    return null;
                }
            }
            const conversations = new ConversationsMock();
            const context = new AppContext()
                .setModels({ conversations });

            const response = await api['GET:/v1/conversations/:id'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('conversation_not_found');
        });
    })
})