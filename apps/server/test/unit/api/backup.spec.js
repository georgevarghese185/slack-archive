const api = require('../../../src/api');
const AppContext = require('../../../src/AppContext')
const { Backups, Conversations, Messages } = require('@slack-archive/common');
const expect = require('chai').expect;
const Request = require('../../../src/types/Request');

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



    describe('GET:/v1/backups/stats', () => {
        it('get backup stats', async () => {
            const expectedBody = {
                messages: 100,
                conversations: 5,
                lastBackupAt: 1583128896216
            };

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

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

            const response = await api['GET:/v1/backups/stats'](context, new Request());

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
                async getActive() {
                    return []
                }

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

            const response = await api['GET:/v1/backups/stats'](context, new Request());

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(expectedBody);
        });
    });


    describe('POST:/v1/backups/new', () => {
        it('create a new backup task', async () => {
            const token = { userId: "U1" }
            let backupStarted = false;
            let backupId;

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

                async create(backupId1, userId) {
                    expect(backupId1).to.be.a('string');
                    expect(userId).to.equal(token.userId);
                    backupId = backupId1;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() })
                .setActions({
                    startBackup(backupId1, token1) {
                        expect(backupId1).to.equal(backupId);
                        expect(token1).to.deep.equal(token)
                        backupStarted = true;
                    }
                });

            const response = await api['POST:/v1/backups/new'](context, new Request(), token);

            expect(backupStarted).to.be.true;
            expect(response.status).to.equal(200);
            expect(response.body.backupId).to.equal(backupId);
        });

        it('trying to run 2 backups at the same time', async () => {
            const token = { userId: "U1" }

            class BackupsMock extends Backups {
                async getActive() {
                    return [{}]
                }

                async create() {}
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() })
                .setActions({
                    startBackup(backupId1, token1) {
                    }
                });

            await api['POST:/v1/backups/new'](context, new Request(), token);
            const response = await api['POST:/v1/backups/new'](context, new Request(), token);

            expect(response.status).to.equal(409);
            expect(response.body.errorCode).to.equal('backup_in_progress');
        });
    });


    describe('GET:/v1/backups/:id', () => {
        it('get backup task', async () => {
            const backupId = '1234';
            const request = new Request({
                parameters: { id: backupId }
            });
            let backupTask = {
                id: backupId,
                createdAt: 1605019424349,
                createdBy: 'U1234',
                endedAt: null,
                status: 'BACKING_UP',
                messagesBackedUp: 1,
                currentConversation: 'C4',
                backedUpConversations: ['C1', 'C2', 'C3'],
                error: null
            }

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

                get(id) {
                    expect(id).to.equal(backupId);
                    return JSON.parse(JSON.stringify(backupTask));
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const test = async () => {
                let response = await api['GET:/v1/backups/:id'](context, request);

                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal({
                    id: backupTask.id,
                    status: backupTask.status,
                    error: backupTask.error,
                    messagesBackedUp: backupTask.messagesBackedUp,
                    currentConversation: backupTask.currentConversation,
                    backedUpConversations: backupTask.backedUpConversations
                });
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
            backupTask.backedUpConversations = [];
            await test();
        });


        it('not found: invalid backup ID', async () => {
            const request = new Request({
                parameters: { id: '1234' }
            });

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

                async get() {
                    return null;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const response = await api['GET:/v1/backups/:id'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('backup_not_found');
        });
    });


    describe('GET:/v1/backups/running', () => {
        it('get a running backup', async () => {
            let backupTask = {
                id: '1234',
                createdAt: 1605019424349,
                createdBy: 'U1234',
                endedAt: null,
                status: 'BACKING_UP',
                messagesBackedUp: 1,
                currentConversation: 'C4',
                backedUpConversations: ['C1', 'C2', 'C3'],
                error: null
            }

            class BackupsMock extends Backups {
                async getActive() {
                    return [backupTask];
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const response = await api['GET:/v1/backups/running'](context, new Request());
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({
                running: [{
                    id: backupTask.id,
                    status: backupTask.status,
                    error: backupTask.error,
                    messagesBackedUp: backupTask.messagesBackedUp,
                    currentConversation: backupTask.currentConversation,
                    backedUpConversations: backupTask.backedUpConversations
                }]
            });
        })
    })



    describe('POST:/v1/backups/:id/cancel', () => {
        it('cancel a backup task', async () => {
            const backupId = '1234';
            const request = new Request({
                parameters: { id: backupId }
            });

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

                async get(id) {
                    return {};
                }

                async cancel(id) {
                    expect(id).to.equal(backupId);
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() })

            const response = await api['POST:/v1/backups/:id/cancel'](context, request);

            expect(response.status).to.equal(200);
        });


        it('not found: invalid backup ID', async () => {
            const request = new Request({
                parameters: { id: '1234' }
            });

            class BackupsMock extends Backups {
                async getActive() {
                    return []
                }

                async get(id) {
                    return null;
                }
            }

            const context = new AppContext()
                .setModels({ backups: new BackupsMock() });

            const response = await api['POST:/v1/backups/:id/cancel'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('backup_not_found');
        })
    });
})