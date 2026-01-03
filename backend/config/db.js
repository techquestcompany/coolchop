const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  username:"coolchop",
  password:"strongpassword123",
  database:"coolchop",
  host:"localhost",
  dialect: 'mysql',
  
});
module.exports = sequelize;
