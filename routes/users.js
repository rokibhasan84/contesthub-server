const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const verifyJWT = require('../middleware/verifyJWT');

// upsert user (called by frontend on login)
router.post('/', async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;
    if (!email) return res.status(400).send({ error: 'email required' });

    const update = { name, photoURL };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate({ email }, update, opts);
    res.send({ ok: true, user });
  } catch (err) {
    res.status(500).send({ error: 'server error' });
  }
});

// get user + token
router.get('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: 'not found' });

    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.send({ email: user.email, role: user.role, token });
  } catch (err) {
    res.status(500).send({ error: 'server error' });
  }
});

// GET all users (ADMIN ONLY)
router.get("/", verifyJWT, async (req, res) => {
  const users = await User.aggregate([
    {
      $addFields: {
        roleOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$role", "admin"] }, then: 1 },
              { case: { $eq: ["$role", "creator"] }, then: 2 }
            ],
            default: 3
          }
        }
      }
    },
    { $sort: { roleOrder: 1, name: 1 } },
    { $project: { roleOrder: 0 } }
  ]);
  res.send(users);
});

// promote user (admin only) — we'll secure later
router.put('/:email/role', verifyJWT, async (req, res) => {
  try {
    // For simplicity assume token user is admin; later add verifyAdmin
    const { email } = req.params;
    const { role } = req.body;
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    res.send({ ok: true, user });
  } catch (err) {
    res.status(500).send({ error: 'server error' });
  }
});

module.exports = router;