// models/PasswordReset.js
const db = require("../db");

const create = async (email, token, expiresAt) => {
  const [result] = await db.execute(
    "INSERT INTO password_resets (email, token, expires_at, used) VALUES (?, ?, ?, ?)",
    [email, token, expiresAt, false],
  );
  return result.insertId;
};

const findValidToken = async (email, token) => {
  const [rows] = await db.execute(
    "SELECT * FROM password_resets WHERE email = ? AND token = ? AND used = false AND expires_at > NOW() LIMIT 1",
    [email, token],
  );
  return rows[0] || null;
};

const markAsUsed = async (id) => {
  const [result] = await db.execute(
    "UPDATE password_resets SET used = true WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
};

const deleteByEmail = async (email) => {
  const [result] = await db.execute(
    "DELETE FROM password_resets WHERE email = ?",
    [email],
  );
  return result.affectedRows > 0;
};

module.exports = {
  create,
  findValidToken,
  markAsUsed,
  deleteByEmail,
};
