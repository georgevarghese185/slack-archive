const {getUserAndAuthToken} = require('../authorize/authorize');
const Pages = require('../strings/pages');
const {Status} = require('./task');
const {Response} = require('../utils/response');
const Op = require('sequelize').Op

const status = async (req, state) => {
  const token = req.cookies.token;
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

  const task = await BackupTasks.findOne({
    where: {
      user_id: user.user_id,
      status: {
        [Op.notIn]: [Status.DONE, Status.CANCELLED, Status.FAILED]
      }
    }
  });

  if(task) {
    task.info = JSON.parse(task.info);
    return new Response(
      200,
      task
    )
  } else {
    return new Response(
      400,
      {
        error: true,
        errorMessage: "No active tasks"
      }
    )
  }
}

module.exports = {
  status
}