const Messages = require('../../Messages');
const { DataTypes, Op } = require('sequelize');

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
        type: DataTypes.TEXT,
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

    async get(from, to, conversationId, postsOnly, threadTs, limit) {
        const where = {};

        if (from) {
            where.ts = where.ts || {};
            where.ts[from.inclusive ? Op.gte : Op.gt] = from.value;
        }

        if (to) {
            where.ts = where.ts || {};
            where.ts[to.inclusive ? Op.lte : Op.lt] = to.value;
        }

        if (conversationId) {
            where.conversation_id = conversationId;
        }

        if (postsOnly) {
            where.is_post = true;
        }

        if (threadTs) {
            where.thread_ts = threadTs;
        }

        const order = [['ts', from ? 'ASC' : 'DESC']];

        const messages = await this.messages.findAll({
            where,
            order,
            limit: limit ? Math.min(limit, 100): 100
        });

        if (!from) {
            messages.reverse();
        }

        return messages.map(m => JSON.parse(m.json));
    }

    async threadExists(threadTs, conversationId) {
        const message = await this.messages.findOne({
            attributes: ['ts'],
            where: {
                thread_ts: threadTs,
                conversation_id: conversationId
            }
        });

        return message != null;
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