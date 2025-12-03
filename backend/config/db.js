const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  username:"root",
  password:"root",
  database:"coolchop",
  host:"localhost",
  dialect: 'mysql',
  
});
module.exports = sequelize;
