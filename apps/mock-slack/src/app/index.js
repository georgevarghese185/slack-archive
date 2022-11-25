const { app } = require('./app');
const { config } = require('dotenv');

config({ path: '.env' });
config({ path: '.env.local' });

const port = process.env.PORT;

app.listen(port, () =>
  console.log(`Slack Mock Server running on port ${port}`),
);
