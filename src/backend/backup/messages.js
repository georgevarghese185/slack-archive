const {updateTask, shouldCancel, Status} = require('./task');
const {getConversationHistory, getConversationReplies} = require('../api/slack/conversations');

const updateMessages = async (state, token, task) => {
  const BackupTasks = state.models.BackupTasks;
  const Conversations = state.models.Conversations;
  const Messages = state.models.Messages;
  const fetch = state.fetch;

  task.status = 'UPDATING_MESSAGES';
  await updateTask(BackupTasks, task).then();

  const onRateLimit = (retryAfter) => {
    task.status = Status.RATE_LIMITED;
    task.info.retry_after = retryAfter;
    updateTask(BackupTasks, task).then();
    return () => {
      task.info.status = 'UPDATING_MESSAGES';
      delete task.info.retry_after;
      updateTask(BackupTasks, task).then();
    }
  }

  const conversations = await Conversations.findAll();
  for(let i = 0; i < conversations.length; i++) {
    const channelId = conversations[i].id;

    let next = () => getConversationHistory(fetch, token, channelId, onRateLimit);
    do {
      const response = await next();
      if(response.error) {
        throw new Error(JSON.stringify(response.slackError));
      }
      const messages = response.messages;
      await addMessages(state, token, task, channelId, messages, onRateLimit);

      if(await shouldCancel(BackupTasks, task)) {
        throw new TaskCancelError();
      } else {
        next = response.next;
      }
    } while(next);
  }
}

const addMessages = async (state, token, task, channelId, messages, onRateLimit) => {
  const Messages = state.models.Messages;
  const BackupTasks = state.models.BackupTasks;
  const messageTimestamps = Object.keys(messages);

  let addedMessages = 0;
  for(let i = 0; i < messageTimestamps.length; i++) {
    const ts = messageTimestamps[i];
    const content = messages[ts];
    await addMessage(state, ts, channelId, content);

    if(content.thread_ts) {
      await addReplies(state, token, task, content.thread_ts, ts, channelId, onRateLimit);
    }
  }

  task.info.messages_backed_up += messageTimestamps.length;
  await updateTask(BackupTasks, task);
}

const addReplies = async(state, token, task, threadTS, parentTS, channelId, onRateLimit) => {
  const BackupTasks = state.models.BackupTasks;
  const fetch = state.fetch;

  let next = () => getConversationReplies(fetch, token, channelId, threadTS, onRateLimit);
  do {
    const response = await next();
    if(response.error) {
      throw new Error(JSON.stringify(response.slackError));
    }
    const replies = response.messages;
    const replyTimestamps = Object.keys(replies);

    for(let i = 0 ; i < replyTimestamps.length; i++) {
      const ts = replyTimestamps[i];
      const message = replies[ts];
      if(ts !== parentTS) {
        await addMessage(state, ts, channelId, message, parentTS);
      }
    }

    if(await shouldCancel(BackupTasks, task)) {
      throw new TaskCancelError();
    } else {
      next = response.next;
    }

    task.info.messages_backed_up += replyTimestamps.length;
    await updateTask(BackupTasks, task);
  } while(next);
}

const addMessage = async (state, ts, channelId, content, parentTS) => {
  const Messages = state.models.Messages;
  const message = await Messages.findOne({where: {ts}});

  const column = {
    ts,
    channel_id: channelId,
    content: JSON.stringify(content),
    parent_ts: parentTS
  }

  if(message) {
    await message.update(column);
  } else {
    await Messages.create(column);
  }
}

module.exports = {
  updateMessages
}
