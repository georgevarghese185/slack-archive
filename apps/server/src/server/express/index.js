const AppContext = require('../../AppContext');
const WinstonLogger = require('../../util/logger/winston');
const { init } = require('./app');

const context = new AppContext()
context.setLogger(new WinstonLogger(context));

init(context)
    .then(app => {
        app.listen(process.env.PORT, () =>
            context.getLogger().info('Slack Archive running on port ' + process.env.PORT));
    })
    .catch(console.error);
