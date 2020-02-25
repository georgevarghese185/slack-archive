const loginTest = require('./login.test');
const conversationsTest = require('./conversations.test');

module.exports = () => {
    loginTest();
    conversationsTest();
}