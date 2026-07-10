// repositories/banner.js

const db = require("../db");

class BannerRepository {
  async create(data) {
    const {
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
      image,
      is_active,
      sort_order,
    } = data;

    const query = `
      INSERT INTO banners (
        title1,
        title2,
        btnTitle1,
        btnLink1,
        btnTitle2,
        btnLink2,
        bannerLink,
        image,
        is_active,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
      image,
      is_active,
      sort_order,
    ];

    const [result] = await db.execute(query, values);

    return result.insertId;
  }

  async getAll() {
    const query = `
      SELECT
        id,
        title1,
        title2,
        btnTitle1,
        btnLink1,
        btnTitle2,
        btnLink2,
        bannerLink,
        image,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM banners
      ORDER BY sort_order ASC, id DESC
    `;

    const [rows] = await db.execute(query);

    return rows;
  }

  async getById(id) {
    const query = `
      SELECT
        id,
        title1,
        title2,
        btnTitle1,
        btnLink1,
        btnTitle2,
        btnLink2,
        bannerLink,
        image,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM banners
      WHERE id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [id]);

    return rows[0] || null;
  }

  async getBySortOrder(sortOrder) {
    const query = `
    SELECT
      id,
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
      image,
      is_active,
      sort_order,
      created_at,
      updated_at
    FROM banners
    WHERE sort_order = ?
    ORDER BY id ASC
  `;

    const [rows] = await db.execute(query, [sortOrder]);

    return rows;
  }

  async update(id, data) {
    const allowedFields = [
      "title1",
      "title2",
      "btnTitle1",
      "btnLink1",
      "btnTitle2",
      "btnLink2",
      "bannerLink",
      "image",
      "is_active",
      "sort_order",
    ];

    const updateFields = [];
    const values = [];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updateFields.length === 0) {
      return false;
    }

    const query = `
      UPDATE banners
      SET
        ${updateFields.join(", ")},
        updated_at = NOW()
      WHERE id = ?
    `;

    values.push(id);

    const [result] = await db.execute(query, values);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const query = `
      DELETE FROM banners
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [id]);

    return result.affectedRows > 0;
  }
}

module.exports = new BannerRepository();
