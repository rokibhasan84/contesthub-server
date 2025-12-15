const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, default: "" },
  role: { type: String, default: "user" }, // user | creator | admin
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);