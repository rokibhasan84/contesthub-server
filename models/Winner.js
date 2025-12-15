const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    contestId: String,
    contestTitle: String,
    winnerEmail: String,
    winnerName: String,
    prizeMoney: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);