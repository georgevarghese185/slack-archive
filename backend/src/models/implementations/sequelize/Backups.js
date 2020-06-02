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

    async create(backupId, userId) {
        const backup = await this.backups.create({
            id: backupId,
            created_at: Date.now(),
            created_by: userId,
            ended_at: null,
            status: 'CREATED',
            messages_backed_up: 0,
            current_conversation: null,
            backed_up_conversations: JSON.stringify([]),
            should_cancel: false,
            error: null
        });

        return this._toBackupObject(backup);
    }

    async last () {
        const lastBackup = await this.backups.findOne({ order: [['ended_at', 'DESC']] });

        if (lastBackup == null) {
            return null;
        }

        return this._toBackupObject(lastBackup);
    }

    async get(id) {
        const backup = await this.backups.findOne({ where: { id } });
        return backup ? this._toBackupObject(backup) : null;
    }

    async setStatus(id, status) {
        await this.backups.update(
            { status },
            { where: { id } }
        );
    }

    async setError(id, message) {
        await this.backups.update(
            { error: message },
            { where: { id } }
        );
    }
}