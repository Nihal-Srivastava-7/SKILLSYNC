const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const resumeCtrl = require("../controllers/resumeController");

router.get("/me", protect, resumeCtrl.getMyResume);
router.put("/personal", protect, resumeCtrl.savePersonal);
router.post("/education", protect, resumeCtrl.addEducation);
router.delete("/education/:id", protect, resumeCtrl.deleteEducation);
router.put("/skills", protect, resumeCtrl.setSkills);
router.post("/projects", protect, resumeCtrl.addProject);
router.delete("/projects/:id", protect, resumeCtrl.deleteProject);
router.get("/templates", protect, resumeCtrl.listTemplates);
router.post("/templates/:id/apply", protect, resumeCtrl.applyTemplate);

module.exports = router;
