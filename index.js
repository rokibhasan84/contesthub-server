require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const verifyJWT = require("./middleware/verifyJWT");
const verifyAdmin = require("./middleware/verifyAdmin");
const verifyCreator = require("./middleware/verifyCreator");
const uploadRouter = require('./routes/upload');
const contestsRouter = require('./routes/contests');

const app = express();
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRouter);
app.use('/api/contests', contestsRouter);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

// connect
mongoose.connect(MONGO)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// User schema

const User = require("./models/User");

// generate jwt
const jwt = require('jsonwebtoken');

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;
    if (!email) return res.status(400).send({ error: 'email required' });

    const update = { name, photoURL };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate({ email }, update, opts);
    return res.send({ ok: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'server error' });
  }
});

// Added contest model (Assuming later)
app.post("/api/contests", verifyJWT, verifyCreator, async (req, res) => {
  // Contest creation here later
  res.send({ ok: true, message: "Contest created successfully" });
});

// get all users
app.get("/api/users", verifyJWT, verifyAdmin, async (req, res) => {
  const users = await User.find();
  res.send(users);
});


// get user + role + token
app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: 'not found' });

    // sign token (short expiry for demo)
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.send({ email: user.email, role: user.role, token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

// change role (admin only )
app.put("/api/users/:email/role", verifyJWT, verifyAdmin, async (req, res) => {
  const { email } = req.params;
  const { role } = req.body;

  const user = await User.findOneAndUpdate(
    { email },
    { role },
    { new: true }
  );

  res.send({ ok: true, user });
});



app.listen(PORT, ()=> console.log('Server running on', PORT));