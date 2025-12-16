const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    fee: { type: Number, required: true },
    prize: { type: Number, required: true },
    deadline: { type: Date, required: true },

    creatorEmail: { type: String, required: true },
    status: { type: String, default: "pending" },

    participants: { type: Number, default: 0 },
    winner: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
