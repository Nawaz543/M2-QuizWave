const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const adminEmail = "admin@quizwave.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isOnline: false,
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();