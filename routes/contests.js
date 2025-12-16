
const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const verifyJWT = require('../middleware/verifyJWT');
const verifyCreator = require('../middleware/verifyCreator');

// create contest (creator/admin) — for now allow any authenticated
router.post("/", verifyJWT, verifyCreator, async (req, res) => {
  try {
    console.log("===== ADD CONTEST API HIT =====");
    console.log("Headers:", req.headers);
    console.log("Decoded user:", req.decoded);
    console.log("Body:", req.body);

    const contest = req.body;

    if (!contest.name || !contest.image || !contest.type) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    contest.status = "pending";
    contest.participantsCount = 0;
    contest.deadline = new Date(contest.deadline);

    const result = await Contest.create(contest);
    res.send(result);

  } catch (error) {
    console.error("🔥 ADD CONTEST ERROR 🔥", error);
    res.status(500).send({ message: error.message });
  }
});

// get all contests
router.get("/", async (req, res) => {
  const {
    status,
    search,
    type,
    sort,
    page = 1,
    limit = 6
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  // filter by type

  if (type) {
    query.type = type;
  }
  // only approved contests
    query.status = "approved";

  let contestsQuery = Contest.find(query);

  if (sort === "price_asc") contestsQuery.sort({ price: 1 });
  if (sort === "price_desc") contestsQuery.sort({ price: -1 });

  const total = await Contest.countDocuments(query);

  const contests = await contestsQuery
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.send({
    contests,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page)
  });
});



router.get("/popular", async (req, res) => {
  const contests = await Contest.find({ status: "approved" })
    .sort({ participantsCount: -1 })
    .limit(6);

  res.send(contests);
});


// get by id
router.get('/:id', async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return res.status(404).send({ message: 'Not found' });
  res.send({ contest });
});

// update contest status
router.patch("/:id/approve", verifyJWT, async (req, res) => {
  const result = await Contest.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );
  res.send(result);
});

router.delete("/:id", verifyJWT, async (req, res) => {
  await Contest.findByIdAndDelete(req.params.id);
  res.send({ success: true });
});



module.exports = router;




// const express = require("express");
// const Contest = require("../models/Contest");
// const verifyJWT = require("../middleware/verifyJWT");
// const verifyCreator = require("../middleware/verifyCreator");
// const verifyAdmin = require("../middleware/verifyAdmin");

// const router = express.Router();

// // add contest
// router.post("/", verifyJWT, verifyCreator, async (req, res) => {
//   try {
//     const contest = {
//       ...req.body,
//       creatorEmail: req.user.email,
//       status: "pending"
//     };

//     const result = await Contest.create(contest);
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ message: "Failed to add contest" });
//   }
// });


// // get all pending contests (ADMIN)
// router.get("/pending/all", verifyJWT, verifyAdmin, async (req, res) => {
//   const contests = await Contest.find({ status: "pending" });
//   res.send(contests);
// });

// // approve contest
// router.patch("/approve/:id", verifyJWT, verifyAdmin, async (req, res) => {
//   const result = await Contest.findByIdAndUpdate(
//     req.params.id,
//     { status: "approved" },
//     { new: true }
//   );
//   res.send(result);
// });

// // reject contest
// router.patch("/reject/:id", verifyJWT, verifyAdmin, async (req, res) => {
//   const result = await Contest.findByIdAndUpdate(
//     req.params.id,
//     { status: "rejected" },
//     { new: true }
//   );
//   res.send(result);
// });

// // get single contest details
// router.get("/:id", async (req, res) => {
//   const contest = await Contest.findById(req.params.id);
//   res.send(contest);
// });

// // participate in contest
// router.patch("/participate/:id", verifyJWT, async (req, res) => {
//   const email = req.user.email;

//   const contest = await Contest.findById(req.params.id);

//   if (contest.participants.includes(email)) {
//     return res.status(400).send({ message: "Already participated" });
//   }

//   contest.participants.push(email);
//   await contest.save();

//   res.send({ message: "Participation successful" });
// });

// // get approved contests
// router.get("/", async (req, res) => {
//   const contests = await Contest.find({ status: "approved" });
//   res.send(contests);
// });

// module.exports = router;