
const express = require("express");
const Contest = require("../models/Contest");
const verifyJWT = require("../middleware/verifyJWT");
const verifyCreator = require("../middleware/verifyCreator");
const verifyAdmin = require("../middleware/verifyAdmin");
const Submission = require("../models/Submission");

const router = express.Router();


  //  ADD CONTEST (Creator/Admin)

router.post("/", verifyJWT, verifyCreator, async (req, res) => {
  try {
    const contest = {
      ...req.body,
      creatorEmail: req.user.email, 
      status: "pending"
    };
    console.log(contest);

    const result = await Contest.create(contest);
    res.send(result);
  } catch (err) {
    console.error("Add contest error:", err.message);
    res.status(400).send({ message: err.message });
  }
});


// GET popular contests
router.get("/popular", async (req, res) => {
  const contests = await Contest.find({ status: "approved" })
    .sort({ participants: -1 })
    .limit(6);

  res.send(contests);
});





// PUBLIC approved contests with pagination, search, filter, sort
router.get("/approved", async (req, res) => {
  try {
    const { search = "", type = "", sort = "", page = 1, limit = 6 } = req.query;

    const query = {
      status: "approved",
      ...(type && { type }),
      ...(search && { name: { $regex: search, $options: "i" } })
    };

    let sortOption = {};
    if (sort === "price_asc") sortOption = { fee: 1 };
    if (sort === "price_desc") sortOption = { fee: -1 };

    const skip = (page - 1) * limit;

    const contests = await Contest.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Contest.countDocuments(query);

    res.send({
      contests,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).send({ message: "Failed to load contests" });
  }
});


  //  GET MY CONTESTS (Creator)

router.get("/my", verifyJWT, verifyCreator, async (req, res) => {
  const email = req.user.email;
  const contests = await Contest.find({ creatorEmail: email })
    .sort({ createdAt: -1 });
  res.send(contests);
});


  //  GET ALL CONTESTS (Admin)

router.get("/", verifyJWT, verifyAdmin, async (req, res) => {
  const contests = await Contest.find().sort({ createdAt: -1 });
  res.send(contests);
});


  //  GET PENDING CONTESTS (Admin)

router.get("/pending/all", verifyJWT, verifyAdmin, async (req, res) => {
  const contests = await Contest.find({ status: "pending" });
  res.send(contests);
});

// user: my winning contests
router.get("/winner/my", verifyJWT, async (req, res) => {
  const email = req.user.email;

  const contests = await Contest.find({
    "winner.email": email
  });

  res.send(contests);
});

router.get("/leaderboard", async (req, res) => {
  try {
    const contests = await Contest.find({
      "winner.email": { $exists: true }
    })
      .select("name prize winner")
      .sort({ prize: -1 });

    res.send(contests);
  } catch (err) {
    res.status(500).send({ message: "Failed to load leaderboard" });
  }
});





  //  APPROVE CONTEST (Admin)

router.patch("/:id/approve", verifyJWT, verifyAdmin, async (req, res) => {
  const result = await Contest.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );
  res.send(result);
});

// winner declares by creator
router.patch("/winner/:id", verifyJWT, verifyCreator, async (req, res) => {
  try {
    const { email, name, photo } = req.body;

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).send({ message: "Contest not found" });
    }

    contest.winner = { email, name, photo };
    contest.status = "completed";
    await contest.save();

    res.send({ message: "Winner declared" });
  } catch (err) {
    res.status(500).send({ message: "Failed to declare winner" });
  }
});

// Get Recent Winners (Public)
router.get("/winners/recent", async (req, res) => {
  try {
    const winners = await Contest.find({
      "winner.email": { $exists: true }
    })
      .select("name prize winner")
      .sort({ createdAt: -1 })
      .limit(5);

    res.send(winners);
  } catch (err) {
    res.status(500).send({ message: "Failed to load recent winners" });
  }
});

// DELETE contest (ADMIN)
router.delete("/:id", verifyJWT, verifyAdmin, async (req, res) => {
  await Contest.findByIdAndDelete(req.params.id);
  res.send({ message: "Contest deleted" });
});



  //  REJECT CONTEST (Admin)

router.patch("/:id/reject", verifyJWT, verifyAdmin, async (req, res) => {
  const result = await Contest.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );
  res.send(result);
});

// register / participate in contest (after payment)
router.patch("/register/:id", verifyJWT, async (req, res) => {
  try {
    const email = req.user.email;
    const contestId = req.params.id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).send({ message: "Contest not found" });
    }

    // already registered?
    if (contest.participants.includes(email)) {
      return res.status(400).send({ message: "Already registered" });
    }

    contest.participants.push(email);
    await contest.save();

    res.send({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Registration failed" });
  }
});

// get contests the logged-in user participated in
router.get("/participated/my", verifyJWT, async (req, res) => {
  try {
    const email = req.user.email;

    const contests = await Contest.find({
      participants: email
    }).select("name status deadline prize image");

    res.send(contests);
  } catch (err) {
    console.error("MY PARTICIPATED ERROR:", err);
    res.status(500).send({ message: "Failed to load participated contests" });
  }
});



// Participate 

router.patch("/participate/:id", verifyJWT, async (req, res) => {
  const email = req.user.email;

  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return res.status(404).send({ message: "Contest not found" });
  }

  if (contest.participants.includes(email)) {
    return res.status(400).send({ message: "Already participated" });
  }

  contest.participants.push(email);
  await contest.save();

  res.send({ message: "Participation successful" });
});

// Submission task

router.post("/submissions", verifyJWT, async (req, res) => {
  const { contestId, taskLink } = req.body;
  const email = req.user.email;

  if (!contestId || !taskLink) {
    return res.status(400).send({ message: "Missing data" });
  }

  const exists = await Submission.findOne({ contestId, userEmail: email });
  if (exists) {
    return res.status(400).send({ message: "Already submitted" });
  }

  const submission = await Submission.create({
    contestId,
    userEmail: email,
    taskLink,
  });

  res.send(submission);
});

// submit task (only registered users)
router.patch("/submit/:id", verifyJWT, async (req, res) => {
  try {
    const email = req.user.email;
    const { taskLink } = req.body;

    if (!taskLink) {
      return res.status(400).send({ message: "Task link required" });
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).send({ message: "Contest not found" });
    }

    // must be registered
    if (!contest.participants.includes(email)) {
      return res.status(403).send({ message: "Not registered" });
    }

    // prevent multiple submission
    const alreadySubmitted = contest.submissions.find(
      (s) => s.userEmail === email
    );
    if (alreadySubmitted) {
      return res.status(400).send({ message: "Already submitted" });
    }

    contest.submissions.push({
      userEmail: email,
      userName: req.user.name,
      userPhoto: req.user.photo,
      taskLink,
      submittedAt: new Date()
    });

    await contest.save();
    res.send({ message: "Task submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Submission failed" });
  }
});
// creator: view submissions
router.get("/submissions/:id", verifyJWT, verifyCreator, async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return res.status(404).send({ message: "Contest not found" });

  res.send(contest.submissions);
});



  //  GET SINGLE CONTEST

router.get("/:id", async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) {
    return res.status(404).send({ message: "Contest not found" });
  }
  res.send(contest);
});


module.exports = router;



