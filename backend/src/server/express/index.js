const AppContext = require('../../AppContext');
const { init } = require('./app');

const context = new AppContext()

init(context)
    .then(app => {
        app.listen(process.env.PORT, () =>
            context.getLogger().log('Slack Archive running on port ' + process.env.PORT));
    })
    .catch(console.error);
