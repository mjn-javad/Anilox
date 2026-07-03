const db = require("../db");

const create = async ({ name, username, email, password }) => {
  const inserQuery =
    "insert into users (name, username, email, password) values (?, ?, ?, ?)";

  const [insertedUser] = await db.execute(inserQuery, [
    name,
    username,
    email,
    password,
  ]);

  const selectMainUser = "SELECT * FROM users WHERE id = ?";
  const user = await db.execute(selectMainUser, [insertedUser.insertId]);

  return user[0][0];
};

const findByUsernameOrEmail = async ({ username, email }) => {
  const query = "select * from users where username=? || email=?";

  const [user] = await db.execute(query, [username, email]);

  return user[0];
};

const findById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [
    id,
  ]);

  return rows[0] || null;
};

const getAll = async () => {
  const rows = await db.execute(
    "SELECT id,name,username,email,role FROM users where 1",
  );

  return rows[0];
};

const getAllAdmins = async () => {
  const rows = await db.execute(
    "SELECT id,name,username,email,role FROM users where role='admin'",
  );

  return rows[0];
};

const getSingleUser = async (id) => {
  const [rows] = await db.execute(
    "SELECT id,name,username,email,role FROM users where id=?",
    [id],
  );

  return rows[0];
};

const promoteToAdmin = async (id) => {
  const [rows] = await db.execute(
    "UPDATE `users` SET `role`='admin' WHERE id=?",
    [id],
  );

  return rows;
};

const preventToUser = async (id) => {
  const [rows] = await db.execute(
    "UPDATE `users` SET `role`='user' WHERE id=?",
    [id],
  );

  return rows;
};

const updatePassword = async (id, hashedPassword) => {
  const [result] = await db.execute(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, id],
  );
  return result.affectedRows > 0;
};

module.exports = {
  create,
  findByUsernameOrEmail,
  findById,
  getAll,
  getAllAdmins,
  getSingleUser,
  promoteToAdmin,
  preventToUser,
  updatePassword,
};
