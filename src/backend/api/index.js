const login = require('./login');

module.exports = {
    'GET:/v1/login/auth-url': login.getAuthUrl
}