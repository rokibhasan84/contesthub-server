
// module.exports = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).send({ message: "Admin only" });
//   }
//   next();
// };


const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const email = req.user.email;
    if (!email) return res.status(401).send({ message: "Unauthorized" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Admin only" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
};