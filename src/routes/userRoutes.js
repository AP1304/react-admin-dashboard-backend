const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

/*
=========================================
Dashboard Statistics
GET /api/users/stats
(Admin Only)
=========================================
*/
router.get(
  "/stats",
  protect,
  adminOnly,
  getUserStats
);

/*
=========================================
Get All Users
GET /api/users?page=1&limit=10&search=
=========================================
*/
router.get(
  "/",
  protect,
  getUsers
);

/*
=========================================
Get User By Id
GET /api/users/:id
=========================================
*/
router.get(
  "/:id",
  protect,
  getUserById
);

/*
=========================================
Create User
POST /api/users
(Admin Only)
=========================================
*/
router.post(
  "/",
  protect,
  adminOnly,
  createUser
);

/*
=========================================
Update User
PUT /api/users/:id
(Admin Only)
=========================================
*/
router.put(
  "/:id",
  protect,
  adminOnly,
  updateUser
);

/*
=========================================
Delete User
DELETE /api/users/:id
(Admin Only)
=========================================
*/
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;