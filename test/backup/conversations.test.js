const Backups = require('../../src/backend/models/Backups');
const Conversations = require('../../src/backend/models/Conversations');
const expect = require('chai').expect;
const moxios = require('moxios');
const { backupConversations } = require('../../src/backend/backup/conversations');

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
            async add(conversations) {
                addedConversations = addedConversations.concat(conversations);
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
        expect(addedConversations).to.deep.equal(conversationList);
        expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
    });



    it('paginated conversations', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        class ConversationsMock extends Conversations {
            async add(conversations) {
                addedConversations = addedConversations.concat(conversations);
            }
        }

        const models = {
            backups: new BackupsMock,
            conversations: new ConversationsMock()
        };

        let requestNo = 0;

        moxios.stubs.track({
            url: /\/conversations\.list.*/,
            get response() {
                requestNo++;
                const channels = requestNo == 1 ? conversationList.slice(0, 2) : conversationList.slice(2);
                const next_cursor = requestNo == 1 ? "abc" : "";

                return {
                    status: 200,
                    response: {
                        ok: true,
                        channels,
                        response_metadata: {
                            next_cursor
                        }
                    }
                }
            }
        });

        await backupConversations(backupId, token, models);
        expect(addedConversations).to.deep.equal(conversationList);

        expect(moxios.requests.count()).to.equal(2);

        expect(moxios.requests.at(0).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).config.params).to.be.undefined;

        expect(moxios.requests.at(1).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).config.params.cursor).to.equal('abc');
    });

    it('rate limited', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        class ConversationsMock extends Conversations {
            async add(conversations) {
                addedConversations = addedConversations.concat(conversations);
            }
        }

        const models = {
            backups: new BackupsMock,
            conversations: new ConversationsMock()
        };

        let delayStart;
        let requestNo = 0;

        moxios.stubs.track({
            url: /\/conversations\.list.*/,
            get response() {
                requestNo++;

                if (requestNo == 1) {
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            channels: conversationList.slice(0, 2),
                            response_metadata: {
                                next_cursor: "abc"
                            }
                        }
                    }
                } else if (requestNo == 2) {
                    delayStart = Date.now();
                    return {
                        status: 429,
                        headers: {
                            'Retry-After': '1'
                        }
                    }
                } else {
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            channels: conversationList.slice(2),
                            response_metadata: {
                                next_cursor: ""
                            }
                        }
                    }
                }
            }
        });

        await backupConversations(backupId, token, models);

        expect(addedConversations).to.deep.equal(conversationList);
        expect(Date.now() - delayStart).to.be.gte(1000);
    });

    it('slack error handling', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        moxios.stubRequest('/conversations.list', {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        const models = {
            backups: new BackupsMock()
        }

        try {
            await backupConversations('123', token, models);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.code).to.equal('some_error');
        }
    });
}