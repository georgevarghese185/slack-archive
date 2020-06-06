const Messages = require('../../Messages');
const { DataTypes } = require('sequelize');

const COLUMNS = {
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
}

module.exports = class MessagesSequelize extends Messages {
    constructor (sequelize) {
        super();
        this.messages = sequelize.define('messages', COLUMNS);
    }

    _toModelObject(conversationId, m) {
        return {
            ts: m.message.ts,
            conversation_id: conversationId,
            thread_ts: m.threadTs,
            is_post: m.isPost,
            json: JSON.stringify(m.message)
        }
    }

    async add(conversationId, messages) {
        const options = {
            updateOnDuplicate: Object.keys(COLUMNS)
        }

        await this.messages.bulkCreate(
            messages.map(m => this._toModelObject(conversationId, m)),
            options
        );
    }

    async count () {
        return this.messages.count()
    }
}