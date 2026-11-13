
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://foodie-cafe-frontend.vercel.app",
    "http://localhost:3000"
  ]
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Foodie Cafe Backend is running!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Foodie Cafe API is working"
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
