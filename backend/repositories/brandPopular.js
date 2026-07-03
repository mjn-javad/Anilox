const db = require("../db");

const getExecutor = (connection) => {
  return connection ? connection : db;
};

/* ========= BRAND / CATEGORY ========= */

// پیدا کردن بر اساس نام
const findBySlug = async (connection, slug) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM brands WHERE slug = ? LIMIT 1",
    [slug],
  );
  return rows[0];
};

const getAllBrands = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute("SELECT * FROM brands");
  return rows;
};

// ایجاد برند یا دسته‌بندی جدید
const create = async (connection, categoryData) => {
  const executor = getExecutor(connection);

  const { name, slug, image } = categoryData;

  const [result] = await executor.execute(
    "INSERT INTO brands (name, slug, image) VALUES (?, ?, ?)",
    [name, slug, image],
  );

  return result.insertId;
};

module.exports = {
  findBySlug,
  create,
  getAllBrands,
};
