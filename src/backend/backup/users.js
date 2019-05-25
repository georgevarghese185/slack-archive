const {listUsers} = require('../api/slack/users');
const {updateTask, shouldCancel, TaskCancelError} = require('./task')

const updateUsers = async (state, token, task) => {
  const Users = state.models.Users;
  const BackupTasks = state.models.BackupTasks;
  const Members = state.models.Members
  const fetch = state.fetch;

  const onRateLimit = () => {
    //TODO
  }

  task.status = 'ADDING_USERS';
  await updateTask(BackupTasks, task);

  let next = () => listUsers(fetch, token, onRateLimit);
  do {
    const response = await next();
    if(response.error) {
      throw new Error(JSON.stringify(response.slackError));
    }
    const members = response.members;

    const userIds = Object.keys(members);
    for(let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      await addMember(Members, userId, members[userId]);
    }

    if(await shouldCancel(task)) {
      next = response.next;
    } else {
      throw new TaskCancelError();
    }
  } while(next);
}

const addMember = async (Members, userId, info) => {
  const member = await Members.findOne({where: {user_id: userId}});
  if(member) {
    await member.update({ info: JSON.stringify(info) });
  } else {
    await Members.create({
      user_id: userId,
      info: JSON.stringify(info)
    })
  }
}

module.exports = {
  updateUsers
}