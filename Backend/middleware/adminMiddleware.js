const ADMIN_EMAIL = "nihalsrivastava2323@gmail.com";

exports.adminOnly = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (req.user.role === "admin" || req.user.email === ADMIN_EMAIL) {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
