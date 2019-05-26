const {updateTask, shouldCancel, State} = require('./task');
const {listConversations} = require('../api/slack/conversations')

const updateConversations = async (state, token, task, backupPrivateChannels) => {
  const BackupTasks = state.models.BackupTasks;
  const Conversations = state.models.Conversations;
  const fetch = state.fetch;

  task.status = 'UPDATING_CONVERSATIONS'
  await updateTask(BackupTasks, task).then();

  const onRateLimit = (retryAfter) => {
    task.status = Status.RATE_LIMITED;
    task.info.retry_after = retryAfter;
    updateTask(BackupTasks, task).then();
    return () => {
      task.info.status = 'UPDATING_CONVERSATIONS';
      delete task.info.retry_after;
      updateTask(BackuptTasks, task).then();
    }
  }

  let next = () => listConversations(fetch, token, backupPrivateChannels, onRateLimit);
  do {
    const response = await next();
    if(response.error) {
      throw new Error(JSON.stringify(response.slackError));
    }
    const channels = response.channels;

    const channelIds = Object.keys(channels);
    for(let i = 0; i < channelIds.length; i++) {
      const channelId = channelIds[i];
      await addChannel(Conversations, channelId, channels[channelId]);
    }

    if(await shouldCancel(BackupTasks, task)) {
      throw new TaskCancelError();
    } else {
      next = response.next;
    }
  } while(next);
}

const addChannel = async (Conversations, channelId, info) => {
  const channel = await Conversations.findOne({where: {id: channelId}});
  if(channel) {
    await channel.update({ info: JSON.stringify(info) });
  } else {
    await Conversations.create({
      id: channelId,
      info: JSON.stringify(info)
    })
  }
}

module.exports = {
  updateConversations
}