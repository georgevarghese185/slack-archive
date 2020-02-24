const login = require('./login');

module.exports = {
    'GET:/v1/login/auth-url': login.getAuthUrl,
    'POST:/v1/login': login.login,
    'GET:/v1/login/status': login.validLogin,
    'DELETE:/v1/login': login.deleteToken
}