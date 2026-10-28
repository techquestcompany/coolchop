
require('dotenv').config();

const db = require('./db');

const config = {
  username: db.config.username,
  password: db.config.password,
  database: db.config.database,
  host: db.config.host,
  port: db.config.port || 3306,
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: config,
  test: config,
  production: config,
};
