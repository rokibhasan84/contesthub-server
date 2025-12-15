const express = require("express");
const router = express.Router();
const Winner = require("../models/Winner");

// add winner (admin)
router.post("/", async (req, res) => {
  const winner = new Winner(req.body);
  await winner.save();
  res.send(winner);
});

// get all winners
router.get("/", async (req, res) => {
  const winners = await Winner.find().sort({ createdAt: -1 });
  res.send(winners);
});

// leaderboard
router.get("/leaderboard", async (req, res) => {
  const leaderboard = await Winner.aggregate([
    {
      $group: {
        _id: "$winnerEmail",
        name: { $first: "$winnerName" },
        wins: { $sum: 1 },
        totalPrize: { $sum: "$prizeMoney" },
      },
    },
    { $sort: { wins: -1 } },
  ]);

  res.send(leaderboard);
});

module.exports = router;