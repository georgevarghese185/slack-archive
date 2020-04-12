const Backups = require('../../src/models/Backups');
const Conversations = require('../../src/models/Conversations');
const decache = require('decache');
const Messages = require('../../src/models/Messages');
const moxios = require('moxios');
const { expect } = require('chai');
const { backupMessages } = require('../../src/backup/messages');
decache('../../src/constants');

module.exports = () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });


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

    it('backup messages and replies', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let c1Messages = [];
        let c2Messages = [];
        let statusSet = false;

        moxios.stubRequest(/\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        moxios.stubRequest(/\/conversations.replies.*/, {
            status: 200,
            response: {
                ok: true,
                messages: replies
            }
        });

        class BackupsMock extends Backups {
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
                } else if (conversationId == 'C2') {
                    expect(c1Messages).to.have.length(messageList.length + replies.length);
                    expect(c2Messages).to.be.empty;
                } else {
                    throw new Error('Wrong conversation ID ' + conversationId);
                }
            }

            async conversationBackupDone(id, conversationId) {
                expect(id).to.equal(backupId);

                if (conversationId == 'C1') {
                    expect(c1Messages).to.have.length(messageList.length + replies.length);
                } else if (conversationId == 'C2') {
                    expect(c2Messages).to.have.length(messageList.length + replies.length);
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

        const models = {
            backups: new BackupsMock(),
            conversations: new ConversationsMock(),
            messages: new MessagesMock(),
        }

        await backupMessages(backupId, token, models);

        expect(statusSet).to.be.true;
        expect(c1Messages).to.deep.equal(messageList.concat(replies));
        expect(c2Messages).to.deep.equal(messageList.concat(replies));

        expect(moxios.requests.at(0).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).url).to.equal(`/conversations.history?channel=C1`);

        expect(moxios.requests.at(1).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).url).to.equal(`/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}`);

        expect(moxios.requests.at(2).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(2).url).to.equal(`/conversations.history?channel=C2`);

        expect(moxios.requests.at(3).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(3).url).to.equal(`/conversations.replies?channel=C2&ts=${messageList[2].thread_ts}`);
    });

    it('paginated messages and replies', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let addedMessages = [];


        class BackupsMock extends Backups {
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

        const models = {
            backups: new BackupsMock(),
            conversations: new ConversationsMock(),
            messages: new MessagesMock(),
        }


        let historyRequestNo = 0;

        moxios.stubs.track({
            url: /\/conversations\.history.*/,
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
            url: /\/conversations\.replies.*/,
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


        await backupMessages(backupId, token, models);
        expect(addedMessages).to.deep.equal(messageList.concat(replies));

        expect(moxios.requests.count()).to.equal(4);

        expect(moxios.requests.at(0).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).url).to.equal(`/conversations.history?channel=C1`);

        expect(moxios.requests.at(1).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).url).to.equal(`/conversations.history?channel=C1&cursor=abc`);

        expect(moxios.requests.at(2).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(2).url).to.equal(`/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}`);

        expect(moxios.requests.at(3).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(3).url).to.equal(`/conversations.replies?channel=C1&ts=${messageList[2].thread_ts}&cursor=def`);
    });

    it('rate limited', async () => {
        const backupId = '1234';
        const accessToken = 'abc';
        const token = { accessToken }
        let addedMessages = [];

        class BackupsMock extends Backups {
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

        const models = {
            backups: new BackupsMock(),
            conversations: new ConversationsMock(),
            messages: new MessagesMock(),
        }


        let historyRequestNo = 0;
        let historyReqDelayStart;
        let historyReqDelayEnd;

        moxios.stubs.track({
            url: /\/conversations\.history.*/,
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
            url: /\/conversations\.replies.*/,
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

        await backupMessages(backupId, token, models);
        expect(addedMessages).to.deep.equal(messageList.concat(replies));
        expect(historyReqDelayEnd - historyReqDelayStart).to.be.gte(1000);
        expect(repliesReqDelayEnd - repliesReqDelayStart).to.be.gte(1000);
    }).timeout(3000);

    it('slack error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends Backups {
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

        const models = {
            backups: new BackupsMock(),
            conversations: new ConversationsMock(),
            messages: new MessagesMock(),
        }

        // conversations.history error

        moxios.stubRequest(/\/conversations.history.*/, {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        try {
            await backupMessages('123', token, models);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/conversations.history API failed with code some_error');
        }

        // conversations.replies error this time

        moxios.stubs.reset();

        moxios.stubRequest(/\/conversations.history.*/, {
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
            await backupMessages('123', token, models);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/conversations.replies API failed with code some_error');
        }
    });

    it('other API error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends Backups {
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

        const models = {
            backups: new BackupsMock(),
            conversations: new ConversationsMock(),
            messages: new MessagesMock(),
        }

        // conversations.history error

        const errorResponse = {
            message: "Something went wrong"
        }

        moxios.stubRequest(/\/conversations.history.*/, {
            status: 500,
            response: errorResponse
        });

        try {
            await backupMessages('123', token, models);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/conversations.history failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }

        // conversations.replies error this time

        moxios.stubs.reset();

        moxios.stubRequest(/\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        moxios.stubRequest(/\/conversations.replies.*/, {
            status: 500,
            response: errorResponse
        });

        try {
            await backupMessages('123', token, models);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/conversations.replies failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }
    });
}