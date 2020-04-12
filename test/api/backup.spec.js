const api = require('../../src/api');
const AppContext = require('../../src/AppContext')
const Backups = require('../../src/models/Backups');
const Conversations = require('../../src/models/Conversations');
const expect = require('chai').expect;
const Messages = require('../../src/models/Messages');
const Request = require('../../src/types/Request');

describe('Backup APIs', () => {
    class MessagesMock extends Messages {
        async count() {
            return 100
        }
    }


    class ConversationsMock extends Conversations {
        async count() {
            return 5
        }
    }



    describe('GET:/v1/backup/stats', () => {
        it('get backup stats', async () => {
            const expectedBody = {
                messages: 100,
                conversations: 5,
                lastBackupAt: 1583128896216
            };

            class BackupsMock extends Backups {
                async last() {
                    return {
                        endedAt: 1583128896216
                    }
                }
            }

            const context = new AppContext()
                .setModels({
                    messages: new MessagesMock(),
                    conversations: new ConversationsMock(),
                    backups: new BackupsMock()
                });

            const response = await api['GET:/v1/backup/stats'](context, new Request());

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(expectedBody);
        });


        it('get backup stats: no last backup', async () => {
            const expectedBody = {
                messages: 100,
                conversations: 5,
                lastBackupAt: null
            };

            class BackupsMock extends Backups {
                async last() {
                    return null;
                }
            }

            const context = new AppContext()
                .setModels({
                    messages: new MessagesMock(),
                    conversations: new ConversationsMock(),
                    backups: new BackupsMock()
                });

            const response = await api['GET:/v1/backup/stats'](context, new Request());

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(expectedBody);
        });
    });


    describe('POST:/v1/backup', () => {
        it('create a new backup task', async () => {
            const token = { userId: "U1" }
            let backupStarted = false;
            let backupId;

            class BackupsMock extends Backups {
                async create(backupId1, userId) {
                    expect(backupId1).to.be.a('string');
                    expect(userId).to.equal(token.userId);
                    backupId = backupId1;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() })
                .setAuthToken(token)
                .setActions({
                    startBackup(backupId1) {
                        expect(backupId1).to.equal(backupId);
                        backupStarted = true;
                    }
                });

            const response = await api['POST:/v1/backup'](context, new Request());

            expect(backupStarted).to.be.true;
            expect(response.status).to.equal(200);
            expect(response.body.backupId).to.equal(backupId);
        });
    });



    describe('GET:/v1/backup/:id', () => {
        it('get backup task', async () => {
            const backupId = '1234';
            const request = new Request({
                parameters: { id: backupId }
            });
            let backupTask = {
                status: 'BACKING_UP',
                messagesBackedUp: 1,
                currentConversation: 'C4',
                backedUpConversations: ['C1', 'C2', 'C3'],
                error: null
            }

            class BackupsMock extends Backups {
                get(id) {
                    expect(id).to.equal(backupId);
                    return JSON.parse(JSON.stringify(backupTask));
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const test = async () => {
                let response = await api['GET:/v1/backup/:id'](context, request);

                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal(backupTask);
            }

            // normal case
            await test();

            // failed backup case: error field present
            backupTask.status = 'FAILED';
            backupTask.error = 'Something went wrong'
            await test();

            // early case: current conversation is null, backedUpConversations is empty
            backupTask.error = null;
            backupTask.status = 'COLLECTING_INFO';
            backupTask.currentConversation = null;
            backupTask.messagesBackedUp = [];
            await test();
        });


        it('not found: invalid backup ID', async () => {
            const request = new Request({
                parameters: { id: '1234' }
            });

            class BackupsMock extends Backups {
                async get() {
                    return null;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const response = await api['GET:/v1/backup/:id'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('backup_not_found');
        });
    });



    describe('POST:/v1/backup/:id/cancel', () => {
        it('cancel a backup task', async () => {
            const backupId = '1234';
            const request = new Request({
                parameters: { id: backupId }
            });

            class BackupsMock extends Backups {
                async get(id) {
                    return {};
                }

                async cancel(id) {
                    expect(id).to.equal(backupId);
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() })

            const response = await api['POST:/v1/backup/:id/cancel'](context, request);

            expect(response.status).to.equal(200);
        });


        it('not found: invalid backup ID', async () => {
            const request = new Request({
                parameters: { id: '1234' }
            });

            class BackupsMock extends Backups {
                async get(id) {
                    return null;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const response = await api['POST:/v1/backup/:id/cancel'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('backup_not_found');
        })
    });
})