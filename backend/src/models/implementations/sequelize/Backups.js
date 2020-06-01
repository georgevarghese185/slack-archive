const Backups = require('../../Backups');
const { DataTypes } = require('sequelize');

module.exports = class BackupsSequelize extends Backups {
    constructor (sequelize) {
        super();
        this.backups = sequelize.define('backups', {
            id: {
                type: DataTypes.TEXT,
                primaryKey: true
            },
            created_at: {
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
            }
        });
    }

    _toBackupObject(row) {
        return {
            id: row.id,
            createdAt: row.created_at,
            createdBy: row.created_by,
            endedAt: row.ended_at ? row.ended_at : null,
            status: row.status,
            messagesBackedUp: row.messages_backed_up,
            currentConversation: row.current_conversation,
            backedUpConversations: JSON.parse(row.backed_up_conversations),
            shouldCancel: row.should_cancel,
            error: row.error
        }
    }

    async last () {
        const lastBackup = await this.backups.findOne({ order: [['ended_at', 'DESC']] });

        if (lastBackup == null) {
            return null;
        }

        return this._toBackupObject(lastBackup);
    }
}