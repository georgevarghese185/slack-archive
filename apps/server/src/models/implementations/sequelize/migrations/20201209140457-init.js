'use strict';
const { DataTypes } = require('sequelize');

const BACKUPS_TABLE = {
    id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_by: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messages_backed_up: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    current_conversation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    backed_up_conversations: {
        type: DataTypes.STRING,
        allowNull: false
    },
    should_cancel: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

const CONVERSATIONS_TABLE = {
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
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

const MEMBERS_TABLE = {
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
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

const MESSAGES_TABLE = {
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
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'backups',
                BACKUPS_TABLE,
                { transaction, timestamps: true }
            );
            await queryInterface.createTable(
                'conversations',
                CONVERSATIONS_TABLE,
                { transaction, timestamps: true }
            );
            await queryInterface.createTable(
                'members',
                MEMBERS_TABLE,
                { transaction, timestamps: true }
            );
            await queryInterface.createTable(
                'messages',
                MESSAGES_TABLE,
                { transaction, timestamps: true }
            );
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    },

    down: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('backups', { transaction });
            await queryInterface.dropTable('conversations', { transaction });
            await queryInterface.dropTable('members', { transaction });
            await queryInterface.dropTable('messages', { transaction });
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
};
