require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@test.com").toLowerCase();
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    theme: "light",
  });

  console.log(`Admin seeded successfully: ${email}`);
  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
