const Resume = require("../models/Resume");

exports.getMyResume = async (req, res) => {
  try {
    let r = await Resume.findOne({ user: req.user._id });
    if (!r) {
      r = await Resume.create({
        user: req.user._id,
        personal: {},
        education: [],
        skills: [],
        projects: [],
      });
    }
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePersonal = async (req, res) => {
  try {
    const data = req.body;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: { personal: data } },
      { new: true, upsert: true }
    );
    res.json(r.personal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addEducation = async (req, res) => {
  try {
    const edu = req.body;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $push: { education: edu } },
      { new: true, upsert: true }
    );
    res.json(r.education);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { education: { _id: id } } },
      { new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: { skills } },
      { new: true, upsert: true }
    );
    res.json(r.skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProject = async (req, res) => {
  try {
    const p = req.body;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $push: { projects: p } },
      { new: true, upsert: true }
    );
    res.json(r.projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { projects: { _id: id } } },
      { new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listTemplates = async (req, res) => {
  // Mock templates - replace with real templates or DB later
  const templates = [
    { id: "tpl1", name: "Professional" },
    { id: "tpl2", name: "Modern" },
    { id: "tpl3", name: "Creative" },
  ];
  res.json(templates);
};

exports.applyTemplate = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: { template: id } },
      { new: true, upsert: true }
    );
    res.json({ success: true, template: r.template });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
