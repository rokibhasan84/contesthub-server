require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");



const app = express();

app.use(cors());
app.use(express.json());

// routes
const userRoutes = require("./routes/users");
const contestRoutes = require("./routes/contests");

app.use("/api/users", userRoutes);
app.use("/api/contests", contestRoutes);

// test route
app.get("/", (req, res) => {
  res.send("ContestHub Server Running");
});


// mongo connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});