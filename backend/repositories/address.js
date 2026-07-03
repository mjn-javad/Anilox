const db = require("../db");

const create = async ({
  user_id,
  full_name,
  phone,
  province,
  city,
  address,
  postal_code,
  is_default,
}) => {
  const insertQuery = `
    INSERT INTO user_addresses 
    (user_id, full_name, phone, province, city, address, postal_code, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(insertQuery, [
    user_id,
    full_name,
    phone,
    province,
    city,
    address,
    postal_code,
    is_default ?? false,
  ]);

  const [rows] = await db.execute("SELECT * FROM user_addresses WHERE id = ?", [
    result.insertId,
  ]);

  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_addresses WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] || null;
};

const findByUserId = async (userId) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_addresses WHERE user_id = ?",
    [userId],
  );

  return rows || null;
};

module.exports = {
  create,
  findById,
  findByUserId,
};
