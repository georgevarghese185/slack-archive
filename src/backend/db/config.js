const path = require('path');

const DEFAULT = {
  "username": "slackarchive",
  "password": "slackarchive",
  "database": "slackarchive",
  "dialect": "postgres",
  "port": "5432",
  "host": "localhost"
}

const getConfig = function() {
  if(process.env.DATABASE_URL) {
    console.log("Using environment DB url")
    const parts = process.env.DATABASE_URL
      .match(/postgres:\/\/([^:]+):([^:]+)@([^:]+):([\d]+)\/(.*)/)

    return {
      username: parts[1],
      password: parts[2],
      host: parts[3],
      port: parts[4],
      dialect: "postgres",
      database: parts[5]
    }
  } else {
    return DEFAULT;
  }
}

module.exports = {
  getConfig
}
