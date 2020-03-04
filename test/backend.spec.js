const apiTest = require('./api/api.spec');
const backupTest = require('./backup/backup.spec');
const Logger = require('../src/util/Logger');
const utilTest = require('./util/util.spec');

Logger.silent = true;

describe('Util functions', utilTest);
describe('API routes', apiTest);
describe('Backup flow', backupTest);