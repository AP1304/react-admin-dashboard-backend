const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  getProfile,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

/*
=========================================
Health Check
GET /api/auth/test
=========================================
*/
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth Route Working",
  });
});

/*
=========================================
Register User
POST /api/auth/signup
=========================================
*/
router.post("/signup", signup);

/*
=========================================
Login User
POST /api/auth/login
=========================================
*/
router.post("/login", login);

/*
=========================================
Logged In User Profile
GET /api/auth/profile
=========================================
*/
router.get("/profile", protect, getProfile);

module.exports = router;