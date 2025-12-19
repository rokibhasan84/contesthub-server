const express = require("express");
const Submission = require("../models/Submission");
const Contest = require("../models/Contest");
const verifyJWT = require("../middleware/verifyJWT");
const verifyCreator = require("../middleware/verifyCreator");

const router = express.Router();


//   Submit task (User)

router.post("/", verifyJWT, async (req, res) => {
  try {
    const submission = await Submission.create({
      contestId: req.body.contestId,
      userEmail: req.user.email,
      taskLink: req.body.taskLink,
    });

    res.send(submission);
  } catch (err) {
    res.status(500).send({ message: "Submission failed" });
  }
});


//  Get submissions by contest (Creator/Admin)
 
router.get("/:contestId", verifyJWT, verifyCreator, async (req, res) => {
  const submissions = await Submission.find({
    contestId: req.params.contestId,
  });

  res.send(submissions);
});


//   Declare winner (Creator/Admin)

router.patch("/winner/:id", verifyJWT, verifyCreator, async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).send({ message: "Submission not found" });
  }

  await Submission.updateMany(
    { contestId: submission.contestId },
    { isWinner: false }
  );

  submission.isWinner = true;
  await submission.save();

  res.send({ message: "Winner declared" });
});

module.exports = router;
