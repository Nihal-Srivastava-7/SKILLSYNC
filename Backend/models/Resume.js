const mongoose = require("mongoose");

// Sub-schemas
const educationSchema = mongoose.Schema({
  school: String,
  degree: String,
  field: String,
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  description: String,
});

const projectSchema = mongoose.Schema({
  title: String,
  link: String,
  techStack: [String],
  summary: String,
});

// Main
const resumeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personal: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      headline: String,
      summary: String,
    },
    education: [educationSchema],
    skills: [{ type: String }],
    projects: [projectSchema],
    template: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
