const db = require("../db");

const getExecutor = (connection) => {
  return connection ? connection : db;
};

/* ========= BRAND / CATEGORY ========= */

// پیدا کردن بر اساس نام
const getAll = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute("SELECT shoe_id FROM best_sellers");
  return rows;
};

const findByShoeId = async (connection, shoeId) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM best_sellers WHERE shoe_id=?",
    [shoeId],
  );
  return rows;
};

const create = async (connection, shoe_id) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "INSERT INTO best_sellers (shoe_id) VALUES (?)",
    [shoe_id],
  );

  return result.insertId;
};

const remove = async (connection, shoeId) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "DELETE FROM best_sellers WHERE shoe_id = ?",
    [shoeId],
  );

  return result.affectedRows; // تعداد رکوردهای حذف شده
};

module.exports = {
  getAll,
  create,
  remove,
  findByShoeId,
};
