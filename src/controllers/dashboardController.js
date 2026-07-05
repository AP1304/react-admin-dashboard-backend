const Employee = require("../models/Employee");
const Activity = require("../models/Activity");

const getDashboardCards = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    const inactiveEmployees = await Employee.countDocuments({ status: "Inactive" });

    const departmentAgg = await Employee.aggregate([
      { $match: { department: { $ne: "" } } },
      { $group: { _id: "$department" } },
    ]);
    const departments = departmentAgg.length;

    res.status(200).json({
      success: true,
      message: "Dashboard cards fetched successfully",
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentEmployees = async (req, res) => {
  try {
    const recent = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName department designation joiningDate status");

    res.status(200).json({
      success: true,
      message: "Recent employees fetched successfully",
      data: recent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardCharts = async (req, res) => {
  try {
    const byDepartment = await Employee.aggregate([
      { $match: { department: { $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const byDesignation = await Employee.aggregate([
      { $match: { designation: { $ne: "" } } },
      { $group: { _id: "$designation", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard charts fetched successfully",
      data: { byDepartment, byDesignation },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("performedBy", "name");

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardCards,
  getRecentEmployees,
  getDashboardCharts,
  getActivities,
};
