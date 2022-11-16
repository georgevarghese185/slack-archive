const { DataTypes } = require('sequelize');
const Conversations = require('../../../../../common/models/Conversations');

const COLUMNS = {
    id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
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
        return await this.conversations.findAll({ attributes: ['id', 'name'] });
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