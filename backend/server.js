const express = require('express');
const sequelize = require('./config/db');
const userRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes')
const restaurantRoutes = require('./routes/restaurantRoutes')
const cors = require('cors');
require('dotenv').config();



const app = express();

app.use(cors());

app.use(express.json());

// routes
app.use('/api/user', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/restaurant', restaurantRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Unable to sync database:', err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
