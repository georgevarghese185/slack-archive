const apiTest = require('./api/api.spec');
const utilTest = require('./util/util.spec');
const Logger = require('../src/util/Logger');

Logger.silent = true;

describe('Util functions', utilTest);
describe('API routes', apiTest);