// routes/contests.js
const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const User = require('../models/User');
const verifyJWT = require('../middleware/verifyJWT');
const verifyCreator = require('../middleware/verifyCreator');
const verifyAdmin = require('../middleware/verifyAdmin');

// Create contest (creator/admin) — (already added earlier)
router.post('/', verifyJWT, verifyCreator, async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.description || !data.task) {
      return res.status(400).send({ message: 'Missing required fields' });
    }
    const contest = new Contest({
      name: data.name,
      image: data.image || '',
      description: data.description,
      entryFee: data.entryFee || 0,
      prize: data.prize || 0,
      task: data.task,
      type: data.type || 'other',
      deadline: data.deadline ? new Date(data.deadline) : null,
      creatorEmail: data.creatorEmail || '',
      participants: {type: Array, default: []},
      status: 'pending'
    });
    const saved = await contest.save();
    res.send({ ok: true, contest: saved });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

/**
 * PARTICIPATE (Register after payment)
 * POST /api/contests/:id/participate
 * Body: { userEmail }
 * Protected: verifyJWT
 * Action: increment participants, create participant record inside contest.submissions? or participants array
 */
router.post('/:id/participate', verifyJWT, async (req, res) => {
  try {
    const contestId = req.params.id;
    const userEmail = req.body.userEmail || req.decoded?.email;
    if (!userEmail) return res.status(400).send({ message: 'userEmail required' });

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).send({ message: 'Contest not found' });

    // check if already participating
    const already = (contest.participantsData || []).some(p => p.email === userEmail);
    if (already) return res.status(400).send({ message: 'Already registered' });

    // add participant
    const participant = {
      email: userEmail,
      registeredAt: new Date(),
      paymentStatus: 'paid' // since we simulate payment success
    };

    contest.participants = (contest.participants || 0) + 1;
    contest.participantsData = contest.participantsData || [];
    contest.participantsData.push(participant);

    await contest.save();

    res.send({ ok: true, message: 'Registered successfully', participant });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

/**
 * SUBMIT TASK
 * POST /api/contests/:id/submit
 * Body: { userEmail, submissionLink, notes }
 * Protected: verifyJWT
 * Action: add submission to contest.submissions
 */
router.post('/:id/submit', verifyJWT, async (req, res) => {
  try {
    const contestId = req.params.id;
    const { submissionLink, notes } = req.body;
    const userEmail = req.body.userEmail || req.decoded?.email;

    if (!submissionLink) return res.status(400).send({ message: 'submissionLink required' });

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).send({ message: 'Contest not found' });

    // ensure user registered before submitting
    const isParticipant = (contest.participantsData || []).some(p => p.email === userEmail);
    if (!isParticipant) {
      return res.status(403).send({ message: 'You must register before submitting' });
    }

    const submission = {
      email: userEmail,
      link: submissionLink,
      notes: notes || '',
      submittedAt: new Date()
    };

    contest.submissions = contest.submissions || [];
    contest.submissions.push(submission);

    await contest.save();

    res.send({ ok: true, message: 'Submission received', submission });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

// get contest by id
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).send({ message: 'Not found' });
    res.send({ contest });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

/**
 * GET submissions for a contest
 * GET /api/contests/:id/submissions
 * Protected: verifyJWT + verifyCreator (only creator or admin can view)
 */
router.get('/:id/submissions', verifyJWT, verifyCreator, async (req, res) => {
  try {
    const contestId = req.params.id;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).send({ message: 'Contest not found' });

    res.send({ ok: true, submissions: contest.submissions || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

/**
 * DECLARE WINNER
 * POST /api/contests/:id/declare
 * Body: { winnerEmail }
 * Protected: verifyJWT + verifyCreator
 * Action: set contest.winner = { email, declaredAt, prizePaid: false }
 */
router.post('/:id/declare', verifyJWT, verifyCreator, async (req, res) => {
  try {
    const contestId = req.params.id;
    const { winnerEmail } = req.body;
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).send({ message: 'Contest not found' });

    // check deadline passed (optional)
    // if (new Date() < new Date(contest.deadline)) return res.status(400).send({ message: 'Deadline not passed' });

    contest.winner = {
      email: winnerEmail,
      declaredAt: new Date(),
      prizePaid: false
    };
    contest.status = 'ended';
    await contest.save();

    res.send({ ok: true, message: 'Winner declared', winner: contest.winner });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error' });
  }
});

module.exports = router;