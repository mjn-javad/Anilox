export const createBrandSlug = (name) =>
  typeof name === "string"
    ? name.trim().toLowerCase().replace(/\s+/gu, "_")
    : "";
