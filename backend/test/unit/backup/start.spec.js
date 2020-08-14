const AppContext = require('../../../src/AppContext');
const Backups = require('../../../../common/models/Backups');
const Conversations = require('../../../../common/models/Conversations');
const Members = require('../../../../common/models/Members');
const Messages = require('../../../../common/models/Messages');
const moxios = require('moxios');
const { startBackup } = require('../../../src/backup');
const { expect } = require('chai');

describe('Backup entry point', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    class MockContext extends AppContext {
        getLogger() {
            return { error: () => {} }
        }
    }

    const conversationList = [
        {
            "id": "C9TAQB16D",
            "name": "useless",
            "is_member": true,
            "num_members": 8
        }
    ];

    const memberList = [
        {
            "id": "U1",
            "name": "user1"
        }
    ];

    const messageList = [
        {
            "ts": "1500000001.000001"
        }
    ];

    it('start and complete backup', async () => {
        let status;

        class ConversationsMock extends Conversations {
            async add() {}
            async listAll() {
                return conversationList;
            }
        }

        class MembersMock extends Members {
            async add() {}
        }

        class MessagesMock extends Messages {
            async add() {}
        }

        class BackupsMock extends Backups {
            setStatus(id, newStatus) {
                status = newStatus;
            }
            conversationBackupDone() {}
            setCurrentConversation() {}
            setMessagesBackedUp() {}
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                members: new MembersMock(),
                conversations: new ConversationsMock(),
                messages: new MessagesMock(),
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

        moxios.stubRequest('/api/users.list', {
            status: 200,
            response: {
                ok: true,
                members: memberList
            }
        });

        moxios.stubRequest(/\/api\/conversations.history.*/, {
            status: 200,
            response: {
                ok: true,
                messages: messageList
            }
        });

        await startBackup(context, '1234', '1234');

        expect(status).to.eq('COMPLETED');
    })

    it('handle error during backup', async () => {
        let status;

        class BackupsMock extends Backups {
            async setStatus(id, newStatus) {
                status = newStatus;
            }

            async setError() {}
        }

        const context = new MockContext()
            .setModels({ backups: new BackupsMock() })

        moxios.stubRequest('/api/conversations.list', { status: 500 });

        await startBackup(context, '1234', '1234');

        expect(status).to.eq('FAILED');
    })
})