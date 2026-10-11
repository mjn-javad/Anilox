const createBrandSlug = (name) => {
  if (typeof name !== "string") return "";
  return name.trim().toLowerCase().replace(/\s+/gu, "_");
};

module.exports = { createBrandSlug };
