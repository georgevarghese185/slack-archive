const Sequelize = require('sequelize');

const UsersModel = (sequelize) => {
  return sequelize.define('users', {
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    token_hash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    encrypted_auth_token: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
}

const MembersModel = (sequelize) => {
  return sequelize.define('members', {
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    info: {
      type: Sequelize.TEXT('MEDIUM'),
      allowNull: false
    }
  });
}

const ConversationsModel = (sequelize) => {
  return sequelize.define('conversations', {
    channel_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    info: {
      type: Sequelize.TEXT('MEDIUM'),
      allowNull: false
    }
  });
}

const MessagesModel = (sequelize) => {
  return sequelize.define('messages', {
    ts: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    channel_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT('MEDIUM'),
    },
    parent_ts: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
}

const BackupTasksModel = (sequelize) => {
  return sequelize.define('backup_tasks', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    },
    info: {
      type: Sequelize.STRING,
      allowNull: false
    },
    should_cancel: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  })
}


module.exports = function(sequelize) {
  return {
    Users: UsersModel(sequelize),
    Members: MembersModel(sequelize),
    Conversations: ConversationsModel(sequelize),
    Messages: MessagesModel(sequelize),
    BackupTasks: BackupTasksModel(sequelize)
  }
}
