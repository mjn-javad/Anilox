// repositories/banner.js
const db = require("../db"); // یا هر طور که داری connection رو میگیری

class BannerRepository {
  async create(data) {
    const { title1, title2, image } = data;
    const query = `
      INSERT INTO banners (title1, title2, image, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.execute(query, [title1, title2, image]);
    return result.insertId;
  }

  async getAll() {
    const query = `
      SELECT id, title1, title2, image, is_active, sort_order, created_at
      FROM banners
      ORDER BY sort_order ASC, id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async getById(id) {
    const query = `SELECT * FROM banners WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  async update(id, data) {
    const { title1, title2, image, is_active, sort_order } = data;
    let query = `UPDATE banners SET title1 = ?, title2 = ?, updated_at = NOW()`;
    const params = [title1, title2];

    if (image) {
      query += `, image = ?`;
      params.push(image);
    }
    if (is_active !== undefined) {
      query += `, is_active = ?`;
      params.push(is_active);
    }
    if (sort_order !== undefined) {
      query += `, sort_order = ?`;
      params.push(sort_order);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.execute(query, params);
    return true;
  }

  async delete(id) {
    const query = `DELETE FROM banners WHERE id = ?`;
    await db.execute(query, [id]);
    return true;
  }

  async updateSortOrder(id, sortOrder) {
    const query = `UPDATE banners SET sort_order = ? WHERE id = ?`;
    await db.execute(query, [sortOrder, id]);
  }
}

module.exports = new BannerRepository();
