module.exports = (req, res, next) => {
  if (req.user.role !== "creator" && req.user.role !== "admin") {
    return res.status(403).send({ message: "Creator only" });
  }
  next();
};


// const User = require("../models/User");

// module.exports = async function verifyCreator(req, res, next) {
//   try {
//     const email = req.decoded?.email;
//     if (!email) {
//       return res.status(401).send({ message: "Unauthorized" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }

//     if (user.role !== "creator" && user.role !== "admin") {
//       return res.status(403).send({ message: "Creator or Admin only" });
//     }

//     next();
//   } catch (error) {
//     console.error("verifyCreator error:", error);
//     res.status(500).send({ message: "Server error" });
//   }
// };
