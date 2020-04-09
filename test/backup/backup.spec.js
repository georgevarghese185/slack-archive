const conversationsTest = require('./conversations.test');
const membersTest = require('./members.test');

module.exports = () => {
    describe('Backup conversations', conversationsTest);
    describe('Backup members', membersTest);
}