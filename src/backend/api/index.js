const backup = require('./backup');
const conversations = require('./conversations');
const login = require('./login');
const members = require('./members');
const messages = require('./messages');

module.exports = {
    'GET:/v1/login/auth-url': login.getAuthUrl,
    'POST:/v1/login': login.login,
    'GET:/v1/login/status': login.validLogin,
    'DELETE:/v1/login': login.deleteToken,

    'GET:/v1/conversations': conversations.list,
    'GET:/v1/conversations/:id': conversations.get,

    'GET:/v1/backup/stats': backup.getStats,
    'POST:/v1/backup': backup.create,

    'GET:/v1/members/:id': members.get,

    'GET:/v1/messages' : messages.get
}