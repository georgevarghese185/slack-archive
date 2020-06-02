const { DataTypes } = require('sequelize');
const Conversations = require('../../Conversations');

const COLUMNS = {
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
}

module.exports = class ConversationsSequelize extends Conversations {
    constructor(sequelize) {
        super();
        this.conversations = sequelize.define('conversations', COLUMNS);
    }

    _toModelObject(conversation) {
        return {
            id: conversation.id,
            name: conversation.name,
            json: JSON.stringify(conversation)
        }
    }

    async listAll() {
        const conversations = await this.conversations.findAll();
        return conversations.map(c => JSON.parse(c.json));
    }

    async get(id) {
        const conversation = await this.conversations.findOne({ where: { id } });
        return JSON.parse(conversation.json);
    }

    async exists(id) {
        const conversation = await this.conversations.findOne({ where: { id } });
        return conversation != null;
    }

    async count() {
        return this.conversations.count();
    }

    async add(conversations) {
        const options = {
            updateOnDuplicate: Object.keys(COLUMNS)
        }
        await this.conversations.bulkCreate(conversations.map(this._toModelObject), options);
    }
}