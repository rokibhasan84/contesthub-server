const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const verifyJWT = require('../middleware/verifyJWT');

// create contest (creator/admin) — for now allow any authenticated
router.post('/', verifyJWT, async (req, res) => {
  try {
    const data = req.body;
    const contest = new Contest(data);
    const saved = await contest.save();
    res.send({ ok: true, contest: saved });
  } catch (err) {
    res.status(500).send({ message: 'Server error' });
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



// router.patch("/:id", async (req, res) => {
//   const { status } = req.body;
//   const result = await Contest.findByIdAndUpdate(
//     req.params.id,
//     { status },
//     { new: true }
//   );
//   res.send(result);
// });

module.exports = router;