const Conversations = require('../../src/backend/models/Conversations');
const decache = require('decache');
const expect = require('chai').expect;

module.exports = () => {
    let api;

    before(() => {
        decache('../../src/backend/api');
        api = require('../../src/backend/api');
    });

    describe('GET:/v1/conversations', () => {
        it('list all conversations', async () => {
            const conversationList = [
                { id: 'C1', name: 'general' },
                { id: 'C2', name: 'random' }
            ];

            class TestConversations extends Conversations {
                async listAll() {
                    return conversationList
                }
            }
            const conversations = new TestConversations();
            const models = { conversations };

            const response = await api['GET:/v1/conversations'](models);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ conversations: conversationList });
        });
    })
}