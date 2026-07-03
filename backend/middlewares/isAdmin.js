// middlewares/isAdmin.js
module.exports = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Admin access required.",
  });
};
