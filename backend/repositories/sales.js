const db = require("../db");

const executor = (connection) => connection || db;

const findByProductId = async (connection, productId) => {
  const [rows] = await executor(connection).execute(
    "SELECT product_id FROM sale_products WHERE product_id = ? LIMIT 1",
    [productId],
  );
  return rows[0] || null;
};

const create = async (connection, productId) => {
  const [result] = await executor(connection).execute(
    "INSERT IGNORE INTO sale_products (product_id) VALUES (?)",
    [productId],
  );
  return result.affectedRows;
};

const remove = async (connection, productId) => {
  const [result] = await executor(connection).execute(
    "DELETE FROM sale_products WHERE product_id = ?",
    [productId],
  );
  return result.affectedRows;
};

module.exports = { findByProductId, create, remove };
