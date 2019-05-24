
const updateTask = async (BackupTasks, task) => {
  const taskEntry = await BackupTasks.findOne({where: {id: task.id}});
  const t = {
    id: task.id,
    user_id: task.user_id,
    status: task.status,
    info: JSON.stringify(task.info),
    should_cancel: task.should_cancel
  }
  if(taskEntry) {
    await taskEntry.update(t);
  } else {
    await BackupTasks.create(t);
  }
}

module.exports = {
  updateTask
}