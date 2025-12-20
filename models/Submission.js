const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    taskLink: {
      type: String,
      required: true,
    },
    userName: String,
    userPhoto: String,
    isWinner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
