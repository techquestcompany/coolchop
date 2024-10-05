const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const path = require('path');


// Load config
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use('/public', express.static(path.join(__dirname, 'public')));


// Apply CORS middleware
app.use(cors());
  
// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));



const PORT = process.env.PORT || 3000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8082;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});
