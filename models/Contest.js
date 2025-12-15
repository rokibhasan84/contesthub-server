const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    description: String,
    price: Number,
    prize: Number,
    type: String, // Image Design, Article Writing etc.
    deadline: Date,
    creatorEmail: String,
    status: { type: String, default: "pending" },
    participantsCount: { type: Number, default: 0 },
    winner: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
