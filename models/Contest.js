const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    fee: { type: Number, required: true },
    prize: { type: Number, required: true },
    deadline: { type: Date, required: true },

    creatorEmail: { type: String, required: true },
    status: { type: String, default: "pending" },

    participants: { type: [String], default: [] },
    winner: {
      name: String,
      photo: String,
      email: String
    },
    submissions: [
      {
        userEmail: String,
        userName: String,
        userPhoto: String,
        taskLink: String,
        submittedAt: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Contest || mongoose.model("Contest", contestSchema);
