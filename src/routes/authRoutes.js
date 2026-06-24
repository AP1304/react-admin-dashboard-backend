const express = require("express");
const router = express.Router();

const {
  signup,
  login,
} = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

router.post("/signup", signup);

router.post("/login", login);

module.exports = router;