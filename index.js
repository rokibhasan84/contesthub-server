require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const uploadRouter = require('./routes/upload');
const contestsRouter = require('./routes/contests');
const usersRouter = require('./routes/users'); // New users router
const winnerRoutes = require('./routes/Winner.routes'); // Winner routes


const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/winners', winnerRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO)
  .then(()=> console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connect error:', err));

app.listen(PORT, ()=> console.log('Server running on', PORT));