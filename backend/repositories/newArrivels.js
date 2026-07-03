const db = require("../db");

const getExecutor = (connection) => {
  return connection ? connection : db;
};

/* ========= BRAND / CATEGORY ========= */

// پیدا کردن بر اساس نام
const getAll = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute("SELECT shoe_id FROM new_arrivels");
  return rows;
};

const findByShoeId = async (connection, shoeId) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM new_arrivels WHERE shoe_id=?",
    [shoeId],
  );
  return rows;
};

const create = async (connection, shoe_id) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "INSERT INTO new_arrivels (shoe_id) VALUES (?)",
    [shoe_id],
  );

  return result.insertId;
};

const remove = async (connection, shoeId) => {
  const executor = getExecutor(connection);

  const [result] = await executor.execute(
    "DELETE FROM new_arrivels WHERE shoe_id = ?",
    [shoeId],
  );

  return result.affectedRows; // تعداد رکوردهای حذف شده
};

module.exports = {
  getAll,
  create,
  findByShoeId,
  remove,
};
