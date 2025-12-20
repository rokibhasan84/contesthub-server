const express = require("express");
const Submission = require("../models/Submission");
const verifyJWT = require("../middleware/verifyJWT");
const verifyCreator = require("../middleware/verifyCreator");

const router = express.Router();


  // USER submits task

router.post("/", verifyJWT, async (req, res) => {
  try {
    const submission = await Submission.create({
      contestId: req.body.contestId,
      taskLink: req.body.taskLink,
      userEmail: req.decoded.email,
      userName: req.body.userName,
      userPhoto: req.body.userPhoto
    });

    res.send(submission);
  } catch (err) {
    res.status(500).send({ message: "Submission failed" });
  }
});


  // CREATOR/Admin view submissions by contest
 
router.get("/:contestId", verifyJWT, verifyCreator, async (req, res) => {
  try {
    const submissions = await Submission.find({
      contestId: req.params.contestId
    }).sort({ createdAt: -1 });

    res.send(submissions);
  } catch {
    res.status(500).send({ message: "Failed to load submissions" });
  }
});

module.exports = router;
