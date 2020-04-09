const Backups = require('../../src/backend/models/Backups');
const expect = require('chai').expect;
const Members = require('../../src/backend/models/Members');
const moxios = require('moxios');
const { backupMembers } = require('../../src/backend/backup/members');



module.exports = () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });


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

        const models = {
            backups: new BackupsMock(),
            members: new MembersMock()
        }

        moxios.stubRequest('/users.list', {
            status: 200,
            response: {
                ok: true,
                members: memberList
            }
        });

        await backupMembers(backupId, token, models);
        const slackRequest = moxios.requests.mostRecent();

        expect(statusSet).to.be.true;
        expect(slackRequest.headers['Authorization']).to.equal('Bearer ' + accessToken);
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

        const models = {
            backups: new BackupsMock(),
            members: new MembersMock()
        }

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

        await backupMembers(backupId, token, models);
        expect(addedMembers).to.deep.equal(memberList);

        expect(moxios.requests.count()).to.equal(2);

        expect(moxios.requests.at(0).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(0).config.params).to.be.undefined;

        expect(moxios.requests.at(1).headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        expect(moxios.requests.at(1).config.params.cursor).to.equal('abc');
    });
}