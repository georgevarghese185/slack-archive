const { app } = require('./app');
const port = process.env.MOCK_SLACK_PORT;

app.listen(port, () => console.log(`Slack Mock Server running on port ${port}`))