const db = require("../db");

const getExecutor = (connection) => {
  return connection ? connection : db;
};

/* ========= BRAND / CATEGORY ========= */

// پیدا کردن بر اساس نام
const getAll = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute("SELECT product_id FROM best_sellers");
  return rows;
};

const findByProductId = async (connection, productId) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM best_sellers WHERE product_id=?",
    [productId],
  );
  return rows;
};

const create = async (connection, product_id) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "INSERT INTO best_sellers (product_id) VALUES (?)",
    [product_id],
  );

  return result.insertId;
};

const remove = async (connection, productId) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "DELETE FROM best_sellers WHERE product_id = ?",
    [productId],
  );

  return result.affectedRows; // تعداد رکوردهای حذف شده
};

module.exports = {
  getAll,
  create,
  remove,
  findByProductId,
};
