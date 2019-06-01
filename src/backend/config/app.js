
const getConfig = function(serverConfig) {
  const missingEnvVariables = [];
  if(!process.env.CLIENT_ID) {
    missingEnvVariables.push('CLIENT_ID');
  }
  if(!process.env.CLIENT_SECRET) {
    missingEnvVariables.push('CLIENT_SECRET');
  }
  if(!process.env.TEAM_ID) {
    missingEnvVariables.push('TEAM_ID');
  }

  if(missingEnvVariables.length > 0) {
    throw new Error("Following environment variables haven't been set:\n" + missingEnvVariables.join(", "));
  }

  return {
    client_id: process.env.CLIENT_ID || "1234",
    client_secret: process.env.CLIENT_SECRET || "1234",
    scope: 'channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read,files:read',
    oauthRedirectRoute: "/slack/OAuth/redirect",
    team_id: process.env.TEAM_ID || "TEAM1234"
  }
}

module.exports = getConfig;
