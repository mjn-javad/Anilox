const path = require("path");
const {
  getPublicProductImageUrl,
  isR2Configured,
} = require("../services/r2Storage");

exports.redirectProductImageToR2 = (req, res, next) => {
  if (!isR2Configured()) return next();

  const filename = String(req.params.filename || "");
  if (!filename || path.basename(filename) !== filename) return next();

  res.set("Cache-Control", "public, max-age=300");
  return res.redirect(302, getPublicProductImageUrl(filename));
};
