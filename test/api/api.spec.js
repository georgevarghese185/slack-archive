const conversationsTest = require('./conversations.test');
const loginTest = require('./login.test');
const membersTest = require('./members.test');
const messagesTest = require('./messages.test');

module.exports = () => {
    loginTest();
    conversationsTest();
    membersTest();
    messagesTest();
}