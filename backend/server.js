const express = require('express');
const sequelize = require('./config/db');
const userRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes')
const restaurantRoutes = require('./routes/restaurantRoutes')
const uploadRoutes = require('./routes/uploadRoutes');
const cors = require('cors');
require('dotenv').config();
const path = require('path');



const app = express();

app.use(cors());

app.use(express.json());



app.use('/public', express.static(path.join(__dirname, 'public')));


// routes
app.use('/api/user', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/upload', uploadRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Unable to sync database:', err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
