const AppContext = require('../../../src/AppContext')
const constants = require('../../../src/constants');
const cookie = require('cookie');
const jwt = require('../../../src/util/jwt');
const Request = require('../../../src/types/Request');
const { authorizeRequest } = require('../../../src/api/authorize');
const { expect } = require('chai');

describe('authorizeRequest()', () => {
    class MockContext extends AppContext {
        getLogger() {
            return { log: () => {}, warn: () => {}, error: () => {} }
        }

        getAuthTokenSecret() {
            return "secret"
        }
    }

    it('valid token', () => {
        const context = new MockContext()
        const token = { accessToken: 'abc', userId: 'U1' };
        const encryptedToken = jwt.sign(
            token,
            context.getAuthTokenSecret(),
            { expiresIn: constants.loginTokenExpiry }
        );
        const request = new Request({
            headers: {
                'Cookie': cookie.serialize('loginToken', encryptedToken)
            }
        });

        const result = authorizeRequest(context, request);

        delete result.iat;
        delete result.exp;

        expect(result).to.deep.equal(token);
    });

    it('invalid token', () => {
        const context = new MockContext()
        const encryptedToken = jwt.sign(
            { a: 'derp' },
            '5678'
        );
        const request = new Request({
            headers: {
                'Cookie': cookie.serialize('loginToken', encryptedToken)
            }
        });

        const result = authorizeRequest(context, request);

        expect(result).to.be.null;
    })
});