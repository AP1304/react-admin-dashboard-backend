const Admin = require("../models/Admin");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    let account = await Admin.findOne({ email });
    let role = "admin";

    if (!account) {
      account = await User.findOne({ email });
      role = "user";
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (role === "user" && account.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      { id: account._id, email: account.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          phone: account.phone || "",
          role,
          theme: account.theme || "light",
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, theme } = req.body;
    const Model = req.user.role === "admin" ? Admin : User;
    const account = await Model.findById(req.user._id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (email && email !== account.email) {
      const existingAdmin = await Admin.findOne({ email });
      const existingUser = await User.findOne({ email });
      if (existingAdmin || existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      account.email = email;
    }

    if (name !== undefined) account.name = name;
    if (phone !== undefined) account.phone = phone;
    if (theme !== undefined && Model === Admin) account.theme = theme;

    await account.save();

    const updated = await Model.findById(account._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const Model = req.user.role === "admin" ? Admin : User;
    const account = await Model.findById(req.user._id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, account.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    account.password = newPassword;
    await account.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
};
