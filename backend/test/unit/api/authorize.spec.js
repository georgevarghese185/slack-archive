const AppContext = require('../../../src/AppContext')
const constants = require('../../../src/constants');
const cookie = require('cookie');
const jwt = require('../../../src/util/jwt');
const Request = require('../../../src/types/Request');
const { validateLogin, TokenParseError, MissingTokenError, ExpiredTokenError } = require('../../../src/api/authorize');
const { expect } = require('chai');

describe('validateLogin()', () => {
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
                'cookie': cookie.serialize('loginToken', encryptedToken)
            }
        });

        const result = validateLogin(context, request);

        delete result.iat;
        delete result.exp;

        expect(result).to.deep.equal(token);
    });

    it('invalid token', () => {
        const context = new MockContext()
        const encryptedToken = jwt.sign(
            { a: 'derp' },
            'wrong secret'
        );
        const request = new Request({
            headers: {
                'cookie': cookie.serialize('loginToken', encryptedToken)
            }
        });

        expect(() => validateLogin(context, request)).to.throw(TokenParseError);
    });

    it('missing cookie', () => {
        const context = new MockContext()
        const request = new Request({});

        expect(() => validateLogin(context, request)).to.throw(MissingTokenError);
    });

    it('missing token', () => {
        const context = new MockContext()
        const token = { accessToken: 'abc', userId: 'U1' };
        const encryptedToken = jwt.sign(
            token,
            context.getAuthTokenSecret(),
            { expiresIn: constants.loginTokenExpiry }
        );
        const request = new Request({
            headers: {
                'cookie': cookie.serialize('notLoginToken', encryptedToken)
            }
        });

        expect(() => validateLogin(context, request)).to.throw(MissingTokenError);
    });

    it('expired token', () => {
        const context = new MockContext()
        const token = { accessToken: 'abc', userId: 'U1' };
        const encryptedToken = jwt.sign(
            token,
            context.getAuthTokenSecret(),
            { expiresIn: '1' }
        );
        const request = new Request({
            headers: {
                'cookie': cookie.serialize('loginToken', encryptedToken)
            }
        });

        expect(() => validateLogin(context, request)).to.throw(ExpiredTokenError);
    });
});