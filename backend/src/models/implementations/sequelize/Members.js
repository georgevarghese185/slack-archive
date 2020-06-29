const Members = require('../../../../../common/models/Members');
const { DataTypes } = require('sequelize');

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
        allowNull: false,
    }
};

class MembersSequelize extends Members {
    constructor(sequelize) {
        super();
        this.members = sequelize.define('members', COLUMNS);
    }

    _toMemberObject(member) {
        return {
            id: member.id,
            name: member.name,
            json: JSON.stringify(member)
        }
    }

    async get(id) {
        const member = await this.members.findOne({ where: { id } });
        return JSON.parse(member.json);
    }

    async add(members) {
        const options = {
            updateOnDuplicate: Object.keys(COLUMNS)
        }
        await this.members.bulkCreate(members.map(this._toMemberObject), options);
    }
}

module.exports = MembersSequelize;
