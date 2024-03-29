const AppContext = require('../../../src/AppContext');
const { Backups, Conversations } = require('@slack-archive/common');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect= chai.expect;
const moxios = require('moxios');
const { BackupCanceledError } = require('../../../src/types/errors');
const { backupConversations } = require('../../../src/backup/conversations');

chai.use(chaiAsPromised);

describe('Conversations Backup', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    class MockContext extends AppContext {
        getSlackBaseUrl() {
            return "https://slack.com"
        }
    }

    class BackupsMockBase extends Backups {
        async shouldCancel() {
            return false;
        }
    }

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

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
                expect(id).to.equal(backupId);
                expect(status).to.equal('COLLECTING_INFO');
                statusSet = true;
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock()
            });

        moxios.stubRequest('/api/conversations.list', {
            status: 200,
            response: {
                "ok": true,
                "channels": conversationList,
                "response_metadata": {
                    "next_cursor": ""
                }
            }
        });

        await backupConversations(context, backupId, token);
        const slackRequest = moxios.requests.mostRecent();

        expect(statusSet).to.be.true;
        expect(addedConversations).to.deep.equal(conversationList);
        expect(slackRequest.config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(slackRequest.headers['authorization']).to.equal(`Bearer ${accessToken}`);
    });



    it('paginated conversations', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
        }

        class ConversationsMock extends Conversations {
            async add(conversations) {
                addedConversations = addedConversations.concat(conversations);
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock()
            });

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

        await backupConversations(context, backupId, token);
        expect(addedConversations).to.deep.equal(conversationList);

        expect(moxios.requests.count()).to.equal(2);

        expect(moxios.requests.at(0).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(0).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).config.params).to.be.undefined;

        expect(moxios.requests.at(1).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(1).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).config.params.cursor).to.equal('abc');
    });

    it('rate limited', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedConversations = [];

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
        }

        class ConversationsMock extends Conversations {
            async add(conversations) {
                addedConversations = addedConversations.concat(conversations);
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock()
            });

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
                            'retry-after': '1'
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

        await backupConversations(context, backupId, token);

        expect(addedConversations).to.deep.equal(conversationList);
        expect(Date.now() - delayStart).to.be.gte(1000);
    });

    it('canceled backup', async () => {
        const backupId = '1234';
        let status;
        let canceled = false;

        class ConversationsMock extends Conversations {
            async add() {}
        }

        class BackupsMock extends Backups {
            async setStatus(id, newStatus) {
                status = newStatus;
            }

            async shouldCancel(id) {
                expect(id).to.eq(backupId);
                return canceled;
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock()
            });

        let requestNo = 0;

        moxios.stubs.track({
            url: /\/conversations\.list.*/,
            get response() {
                requestNo++;

                if (requestNo == 1) {
                    canceled = true;
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
                } else {
                    throw new Error('Should have canceled by now');
                }
            }
        });

        await expect(backupConversations(context, backupId, '1234')).to.be.rejectedWith(BackupCanceledError);
    });

    it('slack error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
        }

        moxios.stubRequest('/api/conversations.list', {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock()
            });

        try {
            await backupConversations(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/conversations.list API failed with code some_error');
        }
    });

    it('other API error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
        }

        const errorResponse = {
            message: "Something went wrong"
        }

        moxios.stubRequest('/api/conversations.list', {
            status: 500,
            response: errorResponse
        });

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock()
            });

        try {
            await backupConversations(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/conversations.list failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }
    });
})