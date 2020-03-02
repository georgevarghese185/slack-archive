const Backups = require('../../src/backend/models/Backups');
const Conversations = require('../../src/backend/models/Conversations');
const decache = require('decache');
const expect = require('chai').expect;
const Messages = require('../../src/backend/models/Messages');
const Request = require('../../src/types/Request');

module.exports = () => {
    let api;

    before(() => {
        decache('../../src/backend/api');
        decache('../../src/constants');
        api = require('../../src/backend/api');
    });


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

            const models = {
                messages: new MessagesMock(),
                conversations: new ConversationsMock(),
                backups: new BackupsMock()
            }

            const response = await api['GET:/v1/backup/stats'](new Request(), models);

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

            const models = {
                messages: new MessagesMock(),
                conversations: new ConversationsMock(),
                backups: new BackupsMock()
            }

            const response = await api['GET:/v1/backup/stats'](new Request(), models);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(expectedBody);
        });
    });
}