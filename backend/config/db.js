const { Sequelize } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize('mysql://root:@localhost:4000/coolchop');
async function connect() {
  

try{
  await sequelize.authenticate();
  console.log("connection succeeded")
}
catch(err){
  console.error("error connecting to database",err)

}
}
connect()
module.exports = sequelize;
