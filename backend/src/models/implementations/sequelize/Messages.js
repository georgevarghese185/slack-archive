const Messages = require('../../Messages');
const { DataTypes } = require('sequelize');

module.exports = class MessagesSequelize extends Messages {
    constructor (sequelize) {
        super();
        this.messages = sequelize.define('messages', {
            ts: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
            conversation_id: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
            thread_ts: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            is_post: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            json: {
                type: DataTypes.JSON,
                allowNull: false
            }
        });
    }

    async count () {
        return this.messages.count()
    }
}