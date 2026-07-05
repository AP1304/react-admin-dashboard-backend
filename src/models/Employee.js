const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre("save", async function () {
  if (this.employeeId) return;

  const last = await mongoose
    .model("Employee")
    .findOne({}, { employeeId: 1 })
    .sort({ createdAt: -1 });

  let nextNum = 1;
  if (last && last.employeeId) {
    const match = last.employeeId.match(/EMP-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  this.employeeId = `EMP-${String(nextNum).padStart(4, "0")}`;
});

module.exports = mongoose.model("Employee", employeeSchema);
