const api = require('../../../src/api');
const AppContext = require('../../../src/AppContext')
const expect = require('chai').expect;
const { Members } = require('@slack-archive/common');
const Request = require('../../../src/types/Request');

describe('Member APIs', () => {
    describe('GET:/v1/members/:id', () => {
        it('get member', async () => {
            const memberId = 'U1';
            const memberObj = {};
            const request = new Request({
                parameters: { id: memberId }
            });

            class MembersMock extends Members {
                async get(id) {
                    expect(id).to.equal(memberId);
                    return memberObj;
                }
            }
            const members = new MembersMock();
            const context = new AppContext()
                .setModels({ members });

            const response = await api['GET:/v1/members/:id'](context, request);

            expect(response.status).to.equal(200);
            expect(response.body).to.equal(memberObj);
        });

        it('not found: invalid member ID', async () => {
            const request = new Request({
                parameters: { id: 'U1' }
            });

            class MembersMock extends Members {
                async get(id) {
                    return null;
                }
            }
            const members = new MembersMock();
            const context = new AppContext()
                .setModels({ members });

            const response = await api['GET:/v1/members/:id'](context, request);

            expect(response.status).to.equal(404);
            expect(response.body.errorCode).to.equal('member_not_found');
        });
    });
})