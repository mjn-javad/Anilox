const db = require("../db");

// ایجاد کاربر تأیید نشده
const create = async ({ name, username, email, password, expires_at }) => {
  const insertQuery = `
    INSERT INTO non_verified_users (name, username, email, password, expires_at) 
    VALUES (?, ?, ?, ?, ?)
  `;

  const [insertedUser] = await db.execute(insertQuery, [
    name,
    username,
    email,
    password,
    expires_at || new Date(Date.now() + 10 * 60 * 1000), // 10 دقیقه پیش‌فرض
  ]);

  const selectQuery = "SELECT * FROM non_verified_users WHERE id = ?";
  const [user] = await db.execute(selectQuery, [insertedUser.insertId]);

  return user[0];
};

// پیدا کردن با ایمیل
const findByEmail = async (email) => {
  const query = "SELECT * FROM non_verified_users WHERE email = ? LIMIT 1";
  const [user] = await db.execute(query, [email]);
  return user[0] || null;
};

// پیدا کردن با نام کاربری
const findByUsername = async (username) => {
  const query = "SELECT * FROM non_verified_users WHERE username = ? LIMIT 1";
  const [user] = await db.execute(query, [username]);
  return user[0] || null;
};

// پیدا کردن با ایمیل یا نام کاربری
const findByEmailOrUsername = async ({ username, email }) => {
  const query =
    "SELECT * FROM non_verified_users WHERE username = ? OR email = ? LIMIT 1";
  const [user] = await db.execute(query, [username, email]);
  return user[0] || null;
};

// پیدا کردن با ID
const findById = async (id) => {
  const query = "SELECT * FROM non_verified_users WHERE id = ? LIMIT 1";
  const [user] = await db.execute(query, [id]);
  return user[0] || null;
};

// حذف کاربر تأیید نشده
const deleteById = async (id) => {
  const query = "DELETE FROM non_verified_users WHERE id = ?";
  const [result] = await db.execute(query, [id]);
  return result.affectedRows > 0;
};

// حذف با ایمیل
const deleteByEmail = async (email) => {
  const query = "DELETE FROM non_verified_users WHERE email = ?";
  const [result] = await db.execute(query, [email]);
  return result.affectedRows > 0;
};

// حذف رکوردهای منقضی شده
const deleteExpired = async () => {
  const query = "DELETE FROM non_verified_users WHERE expires_at < NOW()";
  const [result] = await db.execute(query);
  return result.affectedRows;
};

// حذف رکوردهای قدیمی (بیش از X ساعت)
const cleanupOldRecords = async (hours = 24) => {
  const query =
    "DELETE FROM non_verified_users WHERE created_at < DATE_SUB(NOW(), INTERVAL ? HOUR)";
  const [result] = await db.execute(query, [hours]);
  return result.affectedRows;
};

// گرفتن تمام کاربران تأیید نشده
const getAll = async () => {
  const query =
    "SELECT id, name, username, email, expires_at, created_at FROM non_verified_users ORDER BY created_at DESC";
  const [users] = await db.execute(query);
  return users;
};

// گرفتن کاربران منقضی شده
const getExpired = async () => {
  const query = "SELECT * FROM non_verified_users WHERE expires_at < NOW()";
  const [users] = await db.execute(query);
  return users;
};

// تمدید زمان انقضا
const extendExpiry = async (id, additionalMinutes = 10) => {
  const query = `
    UPDATE non_verified_users 
    SET expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE) 
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [additionalMinutes, id]);
  return result.affectedRows > 0;
};

// بررسی اعتبار کاربر (منقضی نشده باشد)
const isValid = async (email) => {
  const query = `
    SELECT * FROM non_verified_users 
    WHERE email = ? AND expires_at > NOW() 
    LIMIT 1
  `;
  const [user] = await db.execute(query, [email]);
  return user[0] || null;
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  findById,
  deleteById,
  deleteByEmail,
  deleteExpired,
  cleanupOldRecords,
  getAll,
  getExpired,
  extendExpiry,
  isValid,
};
