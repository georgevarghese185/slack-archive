const Backups = require('../../src/backend/models/Backups');
const Conversations = require('../../src/backend/models/Conversations');
const expect = require('chai').expect;
const moxios = require('moxios');
const { backupConversations } = require('../../src/backend/backup/conversations');
const { nextRequest } = require('../helpers');

module.exports = () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });


    const conversationList = [
        {
            "id": "C9TAQB16D",
            "name": "useless",
            "is_member": true,
            "num_members": 8
        },
        {
            "id": "C9TPN8WJF",
            "name": "general",
            "is_member": true,
            "num_members": 3
        },
        {
            "id": "C9TSL1X5Y",
            "name": "random",
            "is_member": true,
            "num_members": 3
        },
        {
            "id": "C9UN3Q2DC",
            "name": "meems",
            "is_member": false,
            "num_members": 5
        }
    ];


    it('backup conversations', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];
        let statusSet = false;

        class ConversationsMock extends Conversations {
            async add(conversationId, name, json) {
                addedConversations.push({
                    id: conversationId,
                    name: name,
                    json
                });
            }
        }

        class BackupsMock extends Backups {
            async setStatus(id, status) {
                expect(id).to.equal(backupId);
                expect(status).to.equal('COLLECTING_INFO');
                statusSet = true;
            }
        }

        const models = {
            backups: new BackupsMock,
            conversations: new ConversationsMock()
        };

        moxios.stubRequest('/conversations.list', {
            status: 200,
            response: {
                "ok": true,
                "channels": conversationList,
                "response_metadata": {
                    "next_cursor": ""
                }
            }
        });

        await backupConversations(backupId, token, models);
        const slackRequest = moxios.requests.mostRecent();

        expect(statusSet).to.be.true;
        expect(addedConversations).to.deep.equal(conversationList.map(c => ({ id: c.id, name: c.name, json: c })));
        expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
    });



    it('paginated conversations', (done) => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];

        moxios.delay = 5;

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        class ConversationsMock extends Conversations {
            async add(conversationId, name, json) {
                addedConversations.push({
                    id: conversationId,
                    name: name,
                    json
                });
            }
        }

        const models = {
            backups: new BackupsMock,
            conversations: new ConversationsMock()
        };

        nextRequest(moxios)
            .then((request) => {
                expect(request.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
                expect(request.config.params).to.be.undefined;

                request.respondWith({
                    status: 200,
                    response: {
                        ok: true,
                        channels: conversationList.slice(0, 2),
                        response_metadata: {
                            next_cursor: "abc"
                        }
                    }
                });

                return nextRequest(moxios);
            })
            .then((request) => {
                expect(request.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
                expect(request.config.params.cursor).to.equal('abc');

                request.respondWith({
                    status: 200,
                    response: {
                        ok: true,
                        channels: conversationList.slice(2),
                        response_metadata: {
                            next_cursor: ""
                        }
                    }
                });
            })
            .catch(done);

        backupConversations(backupId, token, models)
            .then(() => {
                expect(addedConversations).to.deep.equal(conversationList.map(c => ({ id: c.id, name: c.name, json: c })));
                done();
            })
            .catch(done);
    });

    it('slack error handling');
}