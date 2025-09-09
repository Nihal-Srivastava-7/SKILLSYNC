const express = require("express");
const router = express.Router();
const { suggest } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Protected AI suggestions
router.post("/suggest", protect, suggest);

module.exports = router;
