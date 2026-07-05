const Employee = require("../models/Employee");

const getAnalytics = async (req, res) => {
  try {
    const months = Number(req.query.months) || 12;

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

    const byStatus = await Employee.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyJoining = await Employee.aggregate([
      { $match: { joiningDate: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$joiningDate" },
            month: { $month: "$joiningDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      data: {
        byDepartment,
        byDesignation,
        byStatus,
        monthlyJoining,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };
