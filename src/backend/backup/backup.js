const {getUserAndAuthToken} = require('../authorize/authorize');
const {Response} = require('../utils/response');
const {sha256Hash, aesDecrypt} = require('../utils/secure');
const uuid = require('uuid/v4');
const {updateUsers} = require('./users')
const {updateConversations} = require('./conversations');
const {updateMessages} = require('./messages');
const {updateTask, TaskCancelError, Status} = require('./task');
const Pages = require('../strings/pages');

const backup = async (req, state) => {
  const token = req.cookies.login_token;
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
  const {user, authToken} = await getUserAndAuthToken(token, state.models.Users);

  if(!authToken) {
    return signInResponse;
  }

  const taskId = uuid();

  const task = {
    id: taskId,
    user_id: user.user_id,
    status: Status.STARTED,
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
      console.error(e.stack);
      if(e instanceof TaskCancelError) {
        task.status = Status.CANCELLED;
      } else {
        task.status = Status.FAILED;
        task.info.errorMessage = e.toString();
      }
      await updateTask(BackupTasks, task);
    }
  })().then();

  return new Response(
    200,
    { status: 'success', taskId }
  );
}

const startBackup = async (state, token, task, backupPrivateChannels) => {
  const BackupTasks = state.models.BackupTasks;

  await updateUsers(state, token, task);
  await updateConversations(state, token, task, backupPrivateChannels);
  await updateMessages(state, token, task);

  task.status = Status.DONE;
  await updateTask(BackupTasks, task);
}

module.exports = {
  backup
}
