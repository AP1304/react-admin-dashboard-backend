const express = require("express");
const router = express.Router();

const {
  getDashboardCards,
  getRecentEmployees,
  getDashboardCharts,
  getActivities,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

router.get("/cards", protect, getDashboardCards);
router.get("/recent", protect, getRecentEmployees);
router.get("/charts", protect, getDashboardCharts);
router.get("/activities", protect, getActivities);

module.exports = router;
