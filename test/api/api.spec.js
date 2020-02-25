const loginTest = require('./login.test');
const conversationsTest = require('./conversations.test');
const membersTest = require('./members.test');

module.exports = () => {
    loginTest();
    conversationsTest();
    membersTest();
}