const db = require("../db");

const create = async ({ user_id, token, expire_time }) => {
  const inserQuery =
    "insert into refresh_tokens (user_id, token, expire_time) values (?, ?, ?)";

  const [insertedToken] = await db.execute(inserQuery, [
    user_id,
    token,
    expire_time,
  ]);

  const selectMainToken = "SELECT * FROM refresh_tokens WHERE id = ?";
  const refrshToken = await db.execute(selectMainToken, [
    insertedToken.insertId,
  ]);

  return refrshToken[0][0];
};

const remove = async (id) => {
  try {
    const query = "delete from refresh_tokens where id=?";
    const [insertedTag] = await db.execute(query, [id]);
    return insertedTag.affectedRows !== 0;
  } catch (err) {
    throw err;
  }
};

const findOne = async ({ token }) => {
  const [rows] = await db.execute(
    "SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1",
    [token],
  );
  return rows[0] || null;
};

const deleteByToken = async (token) => {
  const [result] = await db.execute(
    "DELETE FROM refresh_tokens WHERE token = ?",
    [token],
  );

  return result.affectedRows > 0;
};

module.exports = {
  create,
  remove,
  findOne,
  deleteByToken,
};
