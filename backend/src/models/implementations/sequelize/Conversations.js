const { DataTypes } = require('sequelize');
const Conversations = require('../../Conversations');

module.exports = class ConversationsSequelize extends Conversations {
    constructor(sequelize) {
        super();
        this.conversations = sequelize.define('conversations', {
            id: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            json: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        });
    }

    async count() {
        return this.conversations.count();
    }
}