require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = "nihalsrivastava2323@gmail.com";
const ADMIN_PASSWORD = "10033001";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    const hashedPassword = ADMIN_PASSWORD;

    if (admin) {
      // Update password and role if user exists
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.status = "active";
      await admin.save();
      process.exit(0);
    }

    // Create new admin if not exists
    admin = new User({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      status: "active",
      role: "admin",
    });
    await admin.save();

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

run();
