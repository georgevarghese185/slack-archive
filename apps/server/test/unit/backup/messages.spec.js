const AppContext = require('../../../src/AppContext')
const { Backups, Conversations, Messages } = require('@slack-archive/common');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const moxios = require('moxios');
const expect = chai.expect;
const { BackupCanceledError } = require('../../../src/types/errors');
const { backupMessages } = require('../../../src/backup/messages');

chai.use(chaiAsPromised);

describe('Messages Backup', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    class MockContext extends AppContext {
        getLogger() {
            return {
                log() {},
                warn() {},
                error() {}
            }
        }

        getSlackBaseUrl() {
            return "https://slack.com"
        }
    }

    class BackupsMockBase extends Backups {
        async shouldCancel() {
            return false;
        }
    }

    const messageList = [
        {
            "ts": "1500000001.000001"
        },
        {
            "ts": "1500000002.000001"
        },
        {
            "ts": "1500000003.000001",                      // has a thread
            "thread_ts": "1500000003.000001"
        },
        {
            "subtype": "thread_broadcast",
            "ts": "1500000006.000001",                      // reply in thread thread, broadcasted to conversation
            "thread_ts": "1500000003.000001"
        }
    ]


    const replies = [
        {
            "ts": "1500000003.000001",
            "thread_ts": "1500000003.000001"
        },
        {
            "ts": "1500000004.000001",
            "thread_ts": "1500000003.000001"
        },
        {
            "ts": "1500000005.000001",
            "thread_ts": "1500000003.000001"
        },
        {
            "ts": "1500000006.000001",
            "thread_ts": "1500000003.000001"                // broadcasted reply
        }
    ];

    const isPost = m => !m.thread_ts || m.thread_ts === m.ts || m.subtype === 'thread_broadcast'

    const toMessageObject = m => ({ isPost: isPost(m), threadTs: m.thread_ts, message: m })

    it('backup messages and replies', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let c1Messages = [];
        let c2Messages = [];
        let statusSet = false;
        let conversationC1Set = false, conversationC2Set = false;
        let conversationC1Done = false, conversationC2Done = false;

        moxios.stubRequest(/\/api\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        moxios.stubRequest(/\/api\/conversations.replies.*/, {
            status: 200,
            response: {
                ok: true,
                messages: replies
            }
        });

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
                expect(id).to.equal(backupId);
                expect(status).to.equal('BACKING_UP');
                statusSet = true;
            }

            async setMessagesBackedUp(id, numOfMessages) {
                expect(id).to.equal(backupId);
                expect(numOfMessages).to.equal(c1Messages.length + c2Messages.length);
            }

            async setCurrentConversation(id, conversationId) {
                expect(id).to.equal(backupId);

                if (conversationId == 'C1') {
                    expect(c1Messages).to.be.empty;
                    expect(c2Messages).to.be.empty;
                    conversationC1Set = true;
                } else if (conversationId == 'C2') {
                    expect(c1Messages).to.have.length(messageList.length + replies.length);
                    expect(c2Messages).to.be.empty;
                    conversationC2Set = true;
                } else {
                    throw new Error('Wrong conversation ID ' + conversationId);
                }
            }

            async conversationBackupDone(id, conversationId) {
                expect(id).to.equal(backupId);

                if (conversationId == 'C1') {
                    expect(c1Messages).to.have.length(messageList.length + replies.length);
                    conversationC1Done = true;
                } else if (conversationId == 'C2') {
                    expect(c2Messages).to.have.length(messageList.length + replies.length);
                    conversationC2Done = true;
                } else {
                    throw new Error('Wrong conversation ID ' + conversationId);
                }
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" },
                    { id: "C2" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                if (conversationId == 'C1') {
                    c1Messages = c1Messages.concat(messages);
                } else if (conversationId == 'C2') {
                    c2Messages = c2Messages.concat(messages);
                } else {
                    throw new Error('Wrong conversation ID ' + conversationId);
                }
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });

        await backupMessages(context, backupId, token);

        expect(statusSet).to.be.true;
        expect(c1Messages).to.deep.equal(messageList.concat(replies).map(toMessageObject));
        expect(c2Messages).to.deep.equal(messageList.concat(replies).map(toMessageObject));
        expect(conversationC1Set).to.be.true;
        expect(conversationC1Done).to.be.true;
        expect(conversationC2Set).to.be.true;
        expect(conversationC2Done).to.be.true;

        expect(moxios.requests.at(0).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(0).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).url).to.equal(`/api/conversations.history?channel=C1`);

        expect(moxios.requests.at(1).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(1).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).url).to.equal(`/api/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}`);

        expect(moxios.requests.at(2).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(2).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(2).url).to.equal(`/api/conversations.history?channel=C2`);

        expect(moxios.requests.at(3).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(3).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(3).url).to.equal(`/api/conversations.replies?channel=C2&ts=${messageList[2].thread_ts}`);
    });

    it('paginated messages and replies', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let addedMessages = [];


        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
            async setMessagesBackedUp(id, numOfMessages) {
            }
            async setCurrentConversation(id, conversationId) {
            }
            async conversationBackupDone(id, conversationId) {
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                expect(conversationId).to.equal('C1');
                addedMessages = addedMessages.concat(messages);
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });


        let historyRequestNo = 0;

        moxios.stubs.track({
            url: /\/api\/conversations\.history.*/,
            get response() {
                historyRequestNo++;
                const messages = historyRequestNo == 1 ? messageList.slice(0, 2) : messageList.slice(2);
                const next_cursor = historyRequestNo == 1 ? "abc" : "";

                return {
                    status: 200,
                    response: {
                        ok: true,
                        messages,
                        response_metadata: {
                            next_cursor
                        }
                    }
                }
            }
        });

        let repliesRequestNo = 0;

        moxios.stubs.track({
            url: /\/api\/conversations\.replies.*/,
            get response() {
                repliesRequestNo++;
                const messages = repliesRequestNo == 1 ? replies.slice(0, 2) : replies.slice(2);
                const next_cursor = repliesRequestNo == 1 ? "def" : "";

                return {
                    status: 200,
                    response: {
                        ok: true,
                        messages,
                        response_metadata: {
                            next_cursor
                        }
                    }
                }
            }
        });


        await backupMessages(context, backupId, token);
        expect(addedMessages).to.deep.equal(messageList.concat(replies).map(toMessageObject));

        expect(moxios.requests.count()).to.equal(4);

        expect(moxios.requests.at(0).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(0).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).url).to.equal(`/api/conversations.history?channel=C1`);

        expect(moxios.requests.at(1).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(1).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).url).to.equal(`/api/conversations.history?channel=C1&cursor=abc`);

        expect(moxios.requests.at(2).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(2).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(2).url).to.equal(`/api/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}`);

        expect(moxios.requests.at(3).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(3).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(3).url).to.equal(`/api/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}&cursor=def`);
    });

    it('rate limited', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let addedMessages = [];

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
            async setMessagesBackedUp(id, numOfMessages) {
            }
            async setCurrentConversation(id, conversationId) {
            }
            async conversationBackupDone(id, conversationId) {
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                expect(conversationId).to.equal('C1');
                addedMessages = addedMessages.concat(messages);
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });


        let historyRequestNo = 0;
        let historyReqDelayStart;
        let historyReqDelayEnd;

        moxios.stubs.track({
            url: /\/api\/conversations\.history.*/,
            get response() {
                historyRequestNo++;

                if (historyRequestNo == 1) {
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: messageList.slice(0, 2),
                            response_metadata: {
                                next_cursor: "abc"
                            }
                        }
                    }
                } else if (historyRequestNo == 2) {
                    historyReqDelayStart = Date.now();
                    return {
                        status: 429,
                        headers: {
                            'Retry-After': '1'
                        }
                    }
                } else {
                    historyReqDelayEnd = Date.now();
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: messageList.slice(2),
                            response_metadata: {
                                next_cursor: ""
                            }
                        }
                    }
                }
            }
        });

        let repliesRequestNo = 0;
        let repliesReqDelayStart;
        let repliesReqDelayEnd;

        moxios.stubs.track({
            url: /\/api\/conversations\.replies.*/,
            get response() {
                repliesRequestNo++;

                if (repliesRequestNo == 1) {
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: replies.slice(0, 2),
                            response_metadata: {
                                next_cursor: "def"
                            }
                        }
                    }
                } else if (repliesRequestNo == 2) {
                    repliesReqDelayStart = Date.now();
                    return {
                        status: 429,
                        headers: {
                            'Retry-After': '1'
                        }
                    }
                } else {
                    repliesReqDelayEnd = Date.now();
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: replies.slice(2),
                            response_metadata: {
                                next_cursor: ""
                            }
                        }
                    }
                }
            }
        });

        await backupMessages(context, backupId, token);
        expect(addedMessages).to.deep.equal(messageList.concat(replies).map(toMessageObject));
        expect(historyReqDelayEnd - historyReqDelayStart).to.be.gte(1000);
        expect(repliesReqDelayEnd - repliesReqDelayStart).to.be.gte(1000);
    });

    it('canceled backup: canceled during history API', async () => {
        const backupId = '1234';
        let status;
        let canceled = false;

        class BackupsMock extends Backups {
            async setStatus(id, newStatus) {
                status = newStatus;
            }

            async shouldCancel(id) {
                expect(id).to.eq(backupId);
                return canceled;
            }

            async setMessagesBackedUp() {}
            async setCurrentConversation(id, conversationId) {}
            async conversationBackupDone(id, conversationId) {}
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                messages = messages.concat(messages);
            }
        }

        let historyRequestNo = 0;

        moxios.stubs.track({
            url: /\/api\/conversations\.history.*/,
            get response() {
                historyRequestNo++;

                if (historyRequestNo == 1) {
                    canceled = true;
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: messageList.slice(0, 2),
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

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });

        await expect(backupMessages(context, backupId, '1234')).to.be.rejectedWith(BackupCanceledError);
    });

    it('canceled backup: canceled during replies API', async () => {
        const backupId = '1234';
        let status;
        let canceled = false;

        class BackupsMock extends Backups {
            async setStatus(id, newStatus) {
                status = newStatus;
            }

            async shouldCancel(id) {
                expect(id).to.eq(backupId);
                return canceled;
            }

            async setMessagesBackedUp() { }
            async setCurrentConversation(id, conversationId) { }
            async conversationBackupDone(id, conversationId) { }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                messages = messages.concat(messages);
            }
        }

        moxios.stubRequest(/\/api\/conversations\.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList,
                response_metadata: {
                    next_cursor: ""
                }
            }
        });

        let repliesRequestNo = 0;

        moxios.stubs.track({
            url: /\/api\/conversations\.replies.*/,
            get response() {
                repliesRequestNo++;

                if (repliesRequestNo == 1) {
                    canceled = true;
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            messages: replies.slice(0, 2),
                            response_metadata: {
                                next_cursor: "abc"
                            }
                        }
                    }
                } else {
                    throw new Error('should have canceled by now');
                }
            }
        });

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });

        await expect(backupMessages(context, backupId, '1234')).to.be.rejectedWith(BackupCanceledError);
    });

    it('channel not found error', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let addedMessages = [];

        moxios.stubRequest(/\/api\/conversations.history.*channel=C1/, {
            status: 200,
            response: {
                ok: false,
                error: 'channel_not_found'
            }
        });

        moxios.stubRequest(/\/api\/conversations.history.*channel=C2/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList.slice(0, 2)
            }
        });

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
            async setMessagesBackedUp(id, numOfMessages) {
            }
            async setCurrentConversation(id, conversationId) {
            }
            async conversationBackupDone(id, conversationId) {
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" },
                    { id: "C2" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
                expect(conversationId).to.equal('C2');
                addedMessages = addedMessages.concat(messages);
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock()
            });

        await backupMessages(context, backupId, token);
        expect(addedMessages).to.deep.equal(messageList.slice(0, 2).map(toMessageObject))
    })

    it('slack error', async () => {
        const token = { accessToken: 'ABC' };
        let conversationError;

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
            async setMessagesBackedUp(id, numOfMessages) {
            }
            async setCurrentConversation(id, conversationId) {
            }
            async conversationBackupDone(id, conversationId) {
            }
            addConversationError(id, conversationId, error) {
                expect(id).to.equal('123');
                conversationError = { conversationId, error };
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [{ id: "C1" }, { id: "C2" }];
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });

        // conversations.history error

        moxios.stubRequest(/\/api\/conversations.history.*channel=C1/, {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        moxios.stubRequest(/\/api\/conversations.history.*channel=C2/, {
            status: 200,
            response: {
                ok: true,
                messages: [],
                response_metadata: {
                    next_cursor: ""
                }
            }
        });

        await backupMessages(context, "123", token);

        expect(conversationError).to.deep.equal({
          conversationId: "C1",
          error: "/api/conversations.history API failed with code some_error",
        });

        // conversations.replies error this time

        moxios.stubs.reset();

        moxios.stubRequest(/\/api\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        moxios.stubRequest(/\/conversations.replies.*/, {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        try {
            await backupMessages(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/conversations.replies API failed with code some_error');
        }
    });

    it('other API error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends BackupsMockBase {
            async setStatus(id, status) {
            }
            async setMessagesBackedUp(id, numOfMessages) {
            }
            async setCurrentConversation(id, conversationId) {
            }
            async conversationBackupDone(id, conversationId) {
            }
        }

        class ConversationsMock extends Conversations {
            async listAll() {
                return [
                    { id: "C1" }
                ]
            }
        }

        class MessagesMock extends Messages {
            async add(conversationId, messages) {
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
            });

        // conversations.history error

        const errorResponse = {
            message: "Something went wrong"
        }

        moxios.stubRequest(/\/api\/conversations.history.*/, {
            status: 500,
            response: errorResponse
        });

        try {
            await backupMessages(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/conversations.history failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }

        // conversations.replies error this time

        moxios.stubs.reset();

        moxios.stubRequest(/\/api\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        moxios.stubRequest(/\/api\/conversations.replies.*/, {
            status: 500,
            response: errorResponse
        });

        try {
            await backupMessages(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/conversations.replies failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }
    });
})