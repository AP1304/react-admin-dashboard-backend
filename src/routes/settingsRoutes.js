const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  updatePassword,
} = require("../controllers/settingsController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);
router.put("/password", protect, updatePassword);

module.exports = router;
