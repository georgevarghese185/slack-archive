
const getConfig = function(serverConfig) {
  return {
    client_id: process.env.CLIENT_ID || "1234",
    client_secret: process.env.CLIENT_SECRET || "1234",
    scope: 'channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read,files:read',
    oauthRedirectUrl: serverConfig.url + "/oauth/redirect",
    team_id: process.env.TEAM_ID || "TEAM1234"
  }
}

module.exports = getConfig;
