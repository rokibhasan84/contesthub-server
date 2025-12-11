const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: "" },
  description: { type: String, required: true },
  entryFee: { type: Number, default: 0 },
  prize: { type: Number, default: 0 },
  task: { type: String, required: true },
  type: { type: String, default: "other" },
  deadline: { type: Date },

  creatorEmail: { type: String },

  // total participants count
  participants: { type: Number, default: 0 },

  // list of participants + payment status
  participantsData: { type: Array, default: [] },

  // submissions info
  submissions: { type: Array, default: [] },

  // contest winner
  winner: { type: Object, default: null },

  status: { type: String, default: "pending" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contest", contestSchema);