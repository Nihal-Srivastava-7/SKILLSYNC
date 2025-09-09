const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const router = express.Router();
const User = require("../models/user");
const Resume = require("../models/Resume");

const ADMIN_EMAIL = "nihalsrivastava2323@gmail.com";

// Public registration/login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile
router.get("/profile", protect, getProfile);

// Admin-only: list users
router.get("/admin/users", protect, adminOnly, async (req, res) => {
  try {
    // return users without passwords
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin-only: view all resumes
router.get("/admin/resumes", protect, adminOnly, async (req, res) => {
  try {
    const resumes = await Resume.find().populate("user", "name email");
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
