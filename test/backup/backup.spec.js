const conversationsTest = require('./conversations.test');
const membersTest = require('./members.test');
const messagesTest = require('./messages.test');

module.exports = () => {
    describe('Backup conversations', conversationsTest);
    describe('Backup members', membersTest);
    describe('Backup messages', messagesTest);
}