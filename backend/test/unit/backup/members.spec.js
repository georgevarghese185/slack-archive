const AppContext = require('../../../src/AppContext')
const Backups = require('../../../src/models/Backups');
const expect = require('chai').expect;
const Members = require('../../../src/models/Members');
const moxios = require('moxios');
const { backupMembers } = require('../../../src/backup/members');



describe('Members Backup', () => {
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

    const memberList = [
        {
            "id": "U1",
            "name": "user1"
        },
        {
            "id": "U2",
            "name": "user2"
        },
        {
            "id": "U3",
            "name": "user3"
        },
        {
            "id": "U4",
            "name": "user4"
        }
    ]


    it('backup members', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedMembers = [];
        let statusSet = false;

        class MembersMock extends Members {
            async add(members) {
                addedMembers = addedMembers.concat(members);
            }
        }

        class BackupsMock extends Backups {
            async setStatus(id, status) {
                expect(id).to.equal(backupId);
                expect(status).to.equal('COLLECTING_INFO');
                statusSet = true;
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                members: new MembersMock()
            });

        moxios.stubRequest('/api/users.list', {
            status: 200,
            response: {
                ok: true,
                members: memberList
            }
        });

        await backupMembers(context, backupId, token);
        const slackRequest = moxios.requests.mostRecent();

        expect(statusSet).to.be.true;
        expect(slackRequest.config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(slackRequest.headers['authorization']).to.equal('Bearer ' + accessToken);
        expect(addedMembers).to.deep.equal(memberList);
    });

    it('paginated members', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedMembers = [];

        class MembersMock extends Members {
            async add(members) {
                addedMembers = addedMembers.concat(members);
            }
        }

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                members: new MembersMock()
            });

        let requestNo = 0;

        moxios.stubs.track({
            url: /\/users\.list.*/,
            get response() {
                requestNo++;
                const members = requestNo == 1 ? memberList.slice(0, 2) : memberList.slice(2);
                const next_cursor = requestNo == 1 ? "abc" : "";

                return {
                    status: 200,
                    response: {
                        ok: true,
                        members,
                        response_metadata: {
                            next_cursor
                        }
                    }
                }
            }
        });

        await backupMembers(context, backupId, token);
        expect(addedMembers).to.deep.equal(memberList);

        expect(moxios.requests.count()).to.equal(2);

        expect(moxios.requests.at(0).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(0).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).config.params).to.be.undefined;

        expect(moxios.requests.at(1).config.baseURL).to.equal(context.getSlackBaseUrl());
        expect(moxios.requests.at(1).headers['authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).config.params.cursor).to.equal('abc');
    });

    it('rate limiting', async () => {
        const accessToken = 'ABC';
        const token = { accessToken };
        const backupId = '1234';
        let addedMembers = [];

        class MembersMock extends Members {
            async add(members) {
                addedMembers = addedMembers.concat(members);
            }
        }

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        const context = new MockContext()
            .setModels({
                backups: new BackupsMock(),
                members: new MembersMock()
            });

        let delayStart;
        let requestNo = 0;

        moxios.stubs.track({
            url: /\/users\.list.*/,
            get response() {
                requestNo++;

                if (requestNo == 1) {
                    return {
                        status: 200,
                        response: {
                            ok: true,
                            members: memberList.slice(0, 2),
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
                            members: memberList.slice(2),
                            response_metadata: {
                                next_cursor: ""
                            }
                        }
                    }
                }
            }
        });

        await backupMembers(context, backupId, token);

        expect(addedMembers).to.deep.equal(memberList);
        expect(Date.now() - delayStart).to.be.gte(1000);
    });

    it('slack error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        moxios.stubRequest('/api/users.list', {
            status: 200,
            response: {
                ok: false,
                error: 'some_error'
            }
        });

        const context = new MockContext()
            .setModels({ backups: new BackupsMock() });

        try {
            await backupMembers(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/users.list API failed with code some_error');
        }
    });

    it('other API error', async () => {
        const token = { accessToken: 'ABC' };

        class BackupsMock extends Backups {
            async setStatus(id, status) {
            }
        }

        const errorResponse = {
            message: "Something went wrong"
        }

        moxios.stubRequest('/api/users.list', {
            status: 500,
            response: errorResponse
        });

        const context = new MockContext()
            .setModels({ backups: new BackupsMock() });

        try {
            await backupMembers(context, '123', token);
            throw new Error('Should have failed');
        } catch (e) {
            expect(e.message).to.equal('/api/users.list failed. status: 500, message: ' + JSON.stringify(errorResponse, null, 2));
        }
    });
})