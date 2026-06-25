require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

/*
=========================================
Connect MongoDB
=========================================
*/
connectDB();

/*
=========================================
Middlewares
=========================================
*/
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // Add your Vercel frontend URL here after deployment
      // "https://your-project.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
=========================================
Health Check
=========================================
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "React Admin Dashboard API Running",
    version: "1.0.0",
  });
});

/*
=========================================
API Routes
=========================================
*/
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/*
=========================================
404 Handler
=========================================
*/
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/*
=========================================
Global Error Handler
=========================================
*/
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/*
=========================================
Start Server
=========================================
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});