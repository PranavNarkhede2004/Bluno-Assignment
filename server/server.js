require('dotenv').config();

const requiredEnv = ['MONGO_URI', 'PORT'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO
require('./socket')(io);

// Routes
const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');
const auctionRoutes = require('./routes/auction');

app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auction', auctionRoutes);

// MongoDB Connection
const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/npl_auction').trim().replace(/^['"]|['"]$/g, '');
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
