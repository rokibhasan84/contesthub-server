router.get("/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  // ALWAYS generate NEW token with latest role
  const token = jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.send({
    user,
    token
  });
});