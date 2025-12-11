const User = require("../models/User");

module.exports = async function verifyCreator(req, res, next) {
  const email = req.decoded.email;

  const user = await User.findOne({ email });

  if (!user || (user.role !== "creator" && user.role !== "admin")) {
    return res.status(403).send({ message: "Creator or Admin only" });
  }

  next();
};