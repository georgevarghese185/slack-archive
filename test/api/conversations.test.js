const Conversations = require('../../src/models/Conversations');
const decache = require('decache');
const expect = require('chai').expect;
const Request = require('../../src/types/Request');

module.exports = () => {
    let api;

    before(() => {
        decache('../../src/api');
        decache('../../src/constants');
        api = require('../../src/api');
    });

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
            const models = { conversations };

            const response = await api['GET:/v1/conversations'](models);

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
            const models = { conversations };

            const response = await api['GET:/v1/conversations/:id'](request, models);

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
            const models = { conversations };

            const response = await api['GET:/v1/conversations/:id'](request, models);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('conversation_not_found');
        });
    })
}