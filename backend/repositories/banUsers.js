const db = require("../db");

const create = async ({ user_id, email }) => {
  const inserQuery = "insert into ban_users (user_id, email) values (?, ?)";

  await db.execute(inserQuery, [user_id, email]);

  return true;
};

const findById = async (user_id) => {
  const [rows] = await db.execute("SELECT * FROM ban_users where user_id=?", [
    user_id,
  ]);

  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM ban_users where email=?", [
    email,
  ]);

  return rows[0];
};

const getAll = async () => {
  const rows = await db.execute("SELECT * FROM ban_users where 1");

  return rows[0];
};

const deleteBanUser = async (user_id) => {
  await db.execute("DELETE FROM ban_users where user_id=?", [user_id]);

  return true;
};

module.exports = { create, getAll, findById, findByEmail, deleteBanUser };
