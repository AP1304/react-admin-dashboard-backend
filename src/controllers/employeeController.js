const Employee = require("../models/Employee");
const Activity = require("../models/Activity");

const getEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
            { designation: { $regex: search, $options: "i" } },
            { employeeId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalEmployees = await Employee.countDocuments(searchQuery);

    const employees = await Employee.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEmployees / limit),
        totalEmployees,
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      status,
      joiningDate,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existing = await Employee.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      status,
      joiningDate: joiningDate || Date.now(),
      createdBy: req.user._id,
    });

    await Activity.create({
      action: "created",
      employeeName: `${employee.firstName} ${employee.lastName}`,
      performedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      status,
      joiningDate,
    } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (email && email !== employee.email) {
      const existing = await Employee.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      employee.email = email;
    }

    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.phone = phone || employee.phone;
    employee.department = department !== undefined ? department : employee.department;
    employee.designation = designation !== undefined ? designation : employee.designation;
    employee.status = status || employee.status;
    if (joiningDate) employee.joiningDate = joiningDate;

    await employee.save();

    await Activity.create({
      action: "updated",
      employeeName: `${employee.firstName} ${employee.lastName}`,
      performedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await Activity.create({
      action: "deleted",
      employeeName: `${employee.firstName} ${employee.lastName}`,
      performedBy: req.user._id,
    });

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
