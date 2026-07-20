const db = require("../db");

const create = async ({
  type,
  name,
  slug,
  brand,
  model,
  category,
  gender,
  price,
  discount_price,
  description,
  colors = null, // اضافه کردن colors به عنوان پارامتر اختیاری
}) => {
  const query = `
    INSERT INTO shoes 
    (type, name, slug, brand, model, category,  gender, price, discount_price, description, colors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    type,
    name,
    slug,
    brand,
    model,
    category,
    gender,
    price,
    discount_price,
    description,
    colors, // ذخیره رنگ‌ها به صورت JSON
  ]);

  return result.insertId;
};

const addImages = async (shoeId, images) => {
  const query = "INSERT INTO shoes_images (shoes_id, image_name) VALUES (?, ?)";

  for (const img of images) {
    const imageName = typeof img === "string" ? img : img.filename;

    await db.execute(query, [shoeId, imageName]);
  }
};

const addSize = async (shoeId, size, quantity) => {
  const query = `
    INSERT INTO shoes_sizes (shoes_id, size, quantity) 
    VALUES (?, ?, ?)
  `;

  const [result] = await db.execute(query, [shoeId, size, quantity]);

  return result.insertId;
};

const remove = async (id) => {
  const [result] = await db.execute("DELETE FROM shoes WHERE id = ?", [id]);

  return result.affectedRows > 0;
};

const increaseStock = async (shoeId, size, quantity) => {
  const query = `
    INSERT INTO shoes_sizes (
      shoes_id,
      size,
      quantity
    )
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      quantity = quantity + VALUES(quantity)
  `;

  const [result] = await db.execute(query, [shoeId, size, quantity]);

  return result.affectedRows > 0;
};

const findById = async (id) => {
  const [shoes] = await db.execute("SELECT * FROM shoes WHERE id = ?", [id]);

  if (!shoes.length) return null;

  const shoe = shoes[0];

  const [images] = await db.execute(
    "SELECT image_name, sort_order FROM shoes_images WHERE shoes_id = ? ORDER BY sort_order DESC",
    [id],
  );

  const [sizes] = await db.execute(
    "SELECT * FROM shoes_sizes WHERE shoes_id = ?",
    [id],
  );

  return {
    ...shoe,
    images,
    sizes,
  };
};

const getAll = async ({
  search,
  type,
  gender,
  brand,
  model,
  category,
  discountOnly = false,
  sort = "created_at",
  order = "DESC",
  page = 1,
  limit = 20,
}) => {
  let limitNumber = Number(limit);

  if (limitNumber > 50) {
    limitNumber = 50;
  }

  const pageNumber = Number(page);
  const offset = (pageNumber - 1) * limitNumber;

  let conditions = [];
  let values = [];

  let brandConditionIndex = -1;
  let brandValueIndex = -1;

  // 🔎 search
  if (search) {
    conditions.push("(s.name LIKE ? OR s.brand LIKE ? OR s.model LIKE ?)");
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // 👟 gender filter
  if (gender) {
    if (gender === "male" || gender === "female") {
      conditions.push("(s.gender = ? OR s.gender = 'genderless')");
      values.push(gender);
    } else {
      conditions.push("s.gender = ?");
      values.push(gender);
    }
  }

  // 👟 type filter
  if (type) {
    conditions.push("s.type = ?");
    values.push(type);
  }

  // 🏷 brand filter
  if (brand) {
    brandConditionIndex = conditions.length;
    brandValueIndex = values.length;

    conditions.push("s.brand = ?");
    values.push(brand);
  }

  // 🏷 model filter
  if (model) {
    conditions.push("s.model = ?");
    values.push(model);
  }

  // 🏷 category filter
  if (category) {
    conditions.push("s.category = ?");
    values.push(category);
  }

  // 🏷 فقط محصولات تخفیف‌دار
  const isDiscountOnly =
    discountOnly === true ||
    discountOnly === "true" ||
    discountOnly === "1" ||
    discountOnly === 1;

  if (isDiscountOnly) {
    conditions.push(`
      s.discount_price IS NOT NULL 
      AND s.discount_price > 0 
      AND s.discount_price < s.price
    `);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  // ساخت شرط برندها بدون فیلتر brand
  const brandsConditions = [...conditions];
  const brandsValues = [...values];

  if (brandConditionIndex !== -1) {
    brandsConditions.splice(brandConditionIndex, 1);
    brandsValues.splice(brandValueIndex, 1);
  }

  brandsConditions.push("s.brand IS NOT NULL");
  brandsConditions.push("TRIM(s.brand) != ''");

  const brandsWhereClause = "WHERE " + brandsConditions.join(" AND ");

  // گرفتن تمام برندهای مربوط به فیلترها به‌جز فیلتر brand
  const [brands] = await db.execute(
    `
    SELECT DISTINCT s.brand AS name
    FROM shoes s
    ${brandsWhereClause}
    ORDER BY s.brand ASC
    `,
    brandsValues,
  );

  // 📊 گرفتن تعداد کل
  const countQuery = `
    SELECT COUNT(*) as total
    FROM shoes s
    ${whereClause}
  `;

  const [countResult] = await db.execute(countQuery, values);
  const total = countResult[0].total;

  // برای امنیت sort و order بهتر است فقط مقادیر مجاز قبول شوند
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "price",
    "discount_price",
    "name",
    "brand",
    "model",
  ];

  const safeSort = allowedSortFields.includes(sort) ? sort : "created_at";
  const safeOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  // 📦 گرفتن دیتا
  const [rows] = await db.execute(
    `
    SELECT s.*
    FROM shoes s
    ${whereClause}
    ORDER BY s.${safeSort} ${safeOrder}
    LIMIT ? OFFSET ?
    `,
    [...values, limitNumber, offset],
  );

  if (rows.length === 0) {
    return {
      data: [],
      brands,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  const shoeIds = rows.map((row) => row.id);

  // دریافت تصاویر فقط برای همین محصولات
  const [allImages] = await db.execute(
    `
    SELECT shoes_id, image_name, sort_order 
    FROM shoes_images 
    WHERE shoes_id IN (${shoeIds.map(() => "?").join(",")})
    ORDER BY sort_order DESC
    `,
    shoeIds,
  );

  const imagesMap = {};

  allImages.forEach((image) => {
    if (!imagesMap[image.shoes_id]) {
      imagesMap[image.shoes_id] = [];
    }

    imagesMap[image.shoes_id].push({
      image_name: image.image_name,
      sort_order: image.sort_order,
    });
  });

  // دریافت موجودی
  const [allSizes] = await db.execute(
    `
    SELECT 
      shoes_id, 
      size, 
      quantity 
    FROM shoes_sizes 
    WHERE shoes_id IN (${shoeIds.map(() => "?").join(",")})
    ORDER BY shoes_id, size
    `,
    shoeIds,
  );

  const sizesByShoe = {};

  allSizes.forEach((item) => {
    if (!sizesByShoe[item.shoes_id]) {
      sizesByShoe[item.shoes_id] = [];
    }

    sizesByShoe[item.shoes_id].push({
      size: item.size,
      quantity: item.quantity,
    });
  });

  // ساخت دیتای نهایی
  const data = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    category: row.category,
    gender: row.gender,
    type: row.type,
    price: parseFloat(row.price),
    discount_price: row.discount_price ? parseFloat(row.discount_price) : null,
    description: row.description,
    colors: row.colors,
    images: imagesMap[row.id] || [],
    sizes: sizesByShoe[row.id] || [],
    total_stock:
      sizesByShoe[row.id]?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    data,
    brands,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getAllNewArrivals = async ({ gender }) => {
  const [newArrivalIds] = await db.execute(
    `
      SELECT shoe_id
      FROM new_arrivels
    `,
  );

  if (newArrivalIds.length === 0) {
    return {
      success: true,
      data: [],
      count: 0,
    };
  }

  const ids = newArrivalIds.map((item) => item.shoe_id);
  const placeholders = ids.map(() => "?").join(",");

  const [rows] = await db.execute(
    `
      SELECT *
      FROM shoes
      WHERE id IN (${placeholders})
      AND gender IN (?, ?)
      ORDER BY FIELD(id, ${placeholders})
    `,
    [...ids, gender, "genderless", ...ids],
  );

  const [allImages] = await db.execute(
    `
      SELECT shoes_id, image_name
      FROM shoes_images
    `,
  );

  const imagesMap = {};

  allImages.forEach((img) => {
    if (!imagesMap[img.shoes_id]) {
      imagesMap[img.shoes_id] = [];
    }

    imagesMap[img.shoes_id].push({
      image_name: img.image_name,
    });
  });

  const newArrivals = rows.map((shoe) => ({
    ...shoe,
    images: imagesMap[shoe.id] || [],
  }));

  return {
    success: true,
    data: newArrivals,
    count: newArrivals.length,
  };
};

const getAllBestSellers = async ({ gender }) => {
  const [bestSellersIds] = await db.execute(
    `
      SELECT shoe_id
      FROM best_sellers
    `,
  );

  if (bestSellersIds.length === 0) {
    return {
      success: true,
      data: [],
      count: 0,
    };
  }

  const ids = bestSellersIds.map((item) => item.shoe_id);
  const placeholders = ids.map(() => "?").join(",");

  const [rows] = await db.execute(
    `
      SELECT *
      FROM shoes
      WHERE id IN (${placeholders})
      AND gender IN (?, ?)
      ORDER BY FIELD(id, ${placeholders})
    `,
    [...ids, gender, "genderless", ...ids],
  );

  const [allImages] = await db.execute(
    `
      SELECT shoes_id, image_name
      FROM shoes_images
    `,
  );

  const imagesMap = {};

  allImages.forEach((img) => {
    if (!imagesMap[img.shoes_id]) {
      imagesMap[img.shoes_id] = [];
    }

    imagesMap[img.shoes_id].push({
      image_name: img.image_name,
    });
  });

  const bestSellers = rows.map((shoe) => ({
    ...shoe,
    images: imagesMap[shoe.id] || [],
  }));

  return {
    success: true,
    data: bestSellers,
    count: bestSellers.length,
  };
};

const updateShoeInfo = async (id, data) => {
  try {
    const fields = [];
    const values = [];

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        fields.push(`\`${key}\` = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0, success: false };
    }

    const query = `UPDATE shoes SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const [result] = await db.execute(query, values);

    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0,
      changedRows: result.changedRows,
    };
  } catch (err) {
    console.error("SQL Update Error:", err.message);
    throw err;
  }
};

const findBySlug = async (connection, slug) => {
  const [rows] = await db.execute(
    "SELECT * FROM shoes WHERE slug = ? LIMIT 1",
    [slug],
  );
  return rows[0];
};

const deleteImagesByNames = async (shoeId, imageNames) => {
  try {
    // اعتبارسنجی ورودی
    if (!shoeId) {
      throw new Error("Shoe ID is required");
    }

    if (!imageNames || !Array.isArray(imageNames) || imageNames.length === 0) {
      return {
        affectedRows: 0,
        deletedCount: 0,
        message: "No images to delete",
      };
    }

    // فیلتر کردن و تبدیل به string به صورت ایمن
    const validImageNames = imageNames
      .filter((name) => name != null && name !== undefined) // حذف null و undefined
      .map((name) => {
        // تبدیل به string و trim کردن
        const strName = String(name).trim();
        return strName;
      })
      .filter((name) => name.length > 0); // حذف رشته‌های خالی

    if (validImageNames.length === 0) {
      return {
        affectedRows: 0,
        deletedCount: 0,
        message: "No valid image names provided",
      };
    }

    // روش امن: حذف تک تک
    let totalAffected = 0;

    for (const imageName of validImageNames) {
      const [result] = await db.execute(
        "DELETE FROM shoes_images WHERE shoes_id = ? AND image_name = ?",
        [shoeId, imageName],
      );
      totalAffected += result.affectedRows;
    }

    return {
      affectedRows: totalAffected,
      deletedCount: totalAffected,
    };
  } catch (error) {
    console.error("Error in deleteImagesByNames:", error);
    throw error;
  }
};

// repositories/shoes.js
const findImageByName = async (shoeId, imageName) => {
  try {
    const shoeIdNum = parseInt(shoeId);
    const imageNameStr = String(imageName).trim();

    if (isNaN(shoeIdNum)) {
      throw new Error("Invalid shoe ID");
    }

    if (!imageNameStr) {
      throw new Error("Image name is required");
    }

    // در MySQL2، نتیجه execute به صورت [rows, fields] برمی‌گردد
    const [rows, fields] = await db.execute(
      `SELECT * FROM shoes_images 
       WHERE shoes_id = ? AND image_name = ?`,
      [shoeIdNum, imageNameStr],
    );

    return rows[0] || null;
  } catch (err) {
    console.error("Error finding image by name:", err);
    throw err;
  }
};

const updateImageSortOrder = async (shoeId, imageName, sortOrder) => {
  try {
    // اطمینان از نوع داده‌ها
    const shoeIdNum = parseInt(shoeId);
    const sortOrderNum = parseInt(sortOrder);
    const imageNameStr = String(imageName).trim();

    if (isNaN(shoeIdNum)) {
      throw new Error("Invalid shoe ID");
    }

    if (isNaN(sortOrderNum) || sortOrderNum < 0) {
      throw new Error("Sort order must be a non-negative integer");
    }

    if (!imageNameStr) {
      throw new Error("Image name is required");
    }

    // ابتدا بررسی کنیم که تصویر وجود دارد
    const existingImage = await findImageByName(shoeIdNum, imageNameStr);
    if (!existingImage) {
      throw new Error(`Image not found: ${imageNameStr}`);
    }

    // به‌روزرسانی - در MySQL2، result به صورت [rows, fields] برمی‌گردد
    const [result, fields] = await db.execute(
      `UPDATE shoes_images 
       SET sort_order = ?
       WHERE shoes_id = ? AND image_name = ?`,
      [sortOrderNum, shoeIdNum, imageNameStr],
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update image sort order");
    }

    // گرفتن اطلاعات به‌روز شده
    const updatedImage = await findImageByName(shoeIdNum, imageNameStr);
    return updatedImage;
  } catch (err) {
    console.error("Error updating image sort order:", err);
    throw err;
  }
};

module.exports = {
  updateShoeInfo,
  getAll,
  getAllNewArrivals,
  getAllBestSellers,
  findById,
  findBySlug,
  remove,
  addSize,
  addImages,
  create,
  deleteImagesByNames,
  updateImageSortOrder,
  findImageByName,
  increaseStock,
};
