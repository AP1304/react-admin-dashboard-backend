const User = require("../models/User");
const bcrypt = require("bcryptjs");

/*
=====================================
GET ALL USERS
GET /api/users?page=1&limit=10&search=amit
=====================================
*/
const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await User.countDocuments(searchQuery);

    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET USER BY ID
=====================================
*/
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
CREATE USER
=====================================
*/
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      status,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      status,
      password: hashedPassword,
    });

    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
UPDATE USER
=====================================
*/
const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role,
      status,
      password,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.department = department || user.department;
    user.designation = designation || user.designation;
    user.role = role || user.role;
    user.status = status || user.status;

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
DELETE USER
=====================================
*/
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
DASHBOARD STATS
GET /api/users/stats
=====================================
*/
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      status: "Active",
    });

    const inactiveUsers = await User.countDocuments({
      status: "Inactive",
    });

    const adminUsers = await User.countDocuments({
      role: "admin",
    });

    const normalUsers = await User.countDocuments({
      role: "user",
    });

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        normalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};