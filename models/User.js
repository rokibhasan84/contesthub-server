const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    photoURL: String,
    role: { type: String, default: "user" }, // user | creator | admin
    bio: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);