const {Response} = require('../utils/response');
const {sha256Hash, aesDecrypt} = require('../utils/secure');
const uuid = require('uuid/v4');
const {updateUsers} = require('./users')
const {updateTask, TaskCancelError} = require('./task');
const Pages = require('../strings/pages');

const backup = async (req, state) => {
  const token = req.cookies.token;
  const backupPrivateChannels = req.backup_private_channels;
  const Users = state.models.Users;
  const BackupTasks = state.models.BackupTasks;
  const signInResponse = new Response(
    401,
    {
      errorMessage: "Invalid/Missing token",
      redirectUrl: state.config.server.url + Pages.SIGN_IN
    }
  );

  if(!token) {
    return signInResponse;
  }

  const tokenHash = sha256Hash(token);
  const user = await Users.findOne({where: {token_hash: tokenHash}});
  if(!user) {
    return signInResponse
  }

  const authToken = aesDecrypt(user.encrypted_auth_token, token);
  const taskId = uuid();

  const task = {
    id: taskId,
    user_id: user.user_id,
    status: 'STARTED',
    info: {
      messages_backed_up: 0
    },
    should_cancel: false
  }

  await updateTask(BackupTasks, task);

  (async () => {
    try {
      await startBackup(state, authToken, task, backupPrivateChannels);
    } catch(e) {
      console.error(e);
      if(e instanceof TaskCancelError) {
        task.status = 'CANCELLED';
      } else {
        task.status = 'FAILED';
        task.info.errorMessage = e.toString();
      }
      await updateTask(BackupTasks, task);
    }
  })().then();

  return new Response(
    200,
    { status: 'success' }
  );
}

const startBackup = async (state, token, task, backupPrivateChannels) => {
  const BackupTasks = state.models.BackupTasks;

  await updateUsers(state, token, task);
  // await updateChannels(state, token, task, backupPrivateChannels);
  // await updateMessages(state, token, task, backupPrivateChannels);

  task.status = 'DONE';
  await updateTask(BackupTasks, task);
}

module.exports = {
  backup
}
