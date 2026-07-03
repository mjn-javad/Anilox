// repositories/discountRepository.js
const db = require("../db"); // مسیر فایل db.js شما

const setDiscountForAllProducts = async (discountPercentage) => {
  const discountMultiplier = 1 - discountPercentage / 100;

  const [result] = await db.execute(
    `UPDATE shoes 
     SET discount_price = ROUND(price * ?, 2)
     WHERE discount_price != ROUND(price * ?, 2) OR discount_price IS NULL`,
    [discountMultiplier, discountMultiplier],
  );

  return result.affectedRows;
};

const removeDiscountFromAllProducts = async () => {
  const [result] = await db.execute(`UPDATE shoes SET discount_price = NULL`);
  return result.affectedRows;
};

const createDiscountCode = async (codeData) => {
  const {
    code,
    discount_type = "percentage",
    discount_value,
    applies_to = "all_products",
    product_id = null,
    max_uses = null,
    valid_from = null,
    valid_until = null,
  } = codeData;

  const [result] = await db.execute(
    `INSERT INTO discount_codes 
     (code, discount_type, discount_value, applies_to, product_id, max_uses, valid_from, valid_until)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      discount_type,
      discount_value,
      applies_to,
      product_id,
      max_uses,
      valid_from,
      valid_until,
    ],
  );

  return result.insertId;
};

const getAllDiscountCodes = async () => {
  const [rows] = await db.execute(
    `SELECT 
      dc.*,
      s.name as product_name,
      s.slug as product_slug
     FROM discount_codes dc
     LEFT JOIN shoes s ON dc.product_id = s.id
     ORDER BY dc.created_at DESC`,
  );
  return rows;
};

const getDiscountCodeByCode = async (code) => {
  const [rows] = await db.execute(
    `SELECT 
      dc.*,
      s.price as original_price,
      s.discount_price as product_discount_price
     FROM discount_codes dc
     LEFT JOIN shoes s ON dc.product_id = s.id
     WHERE dc.code = ? AND dc.is_active = TRUE
     AND (dc.valid_from IS NULL OR dc.valid_from <= NOW())
     AND (dc.valid_until IS NULL OR dc.valid_until >= NOW())
     AND (dc.max_uses IS NULL OR dc.used_count < dc.max_uses)`,
    [code],
  );
  return rows[0];
};

const getDiscountCodeById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM discount_codes WHERE id = ?`, [
    id,
  ]);
  return rows[0];
};

const deleteDiscountCode = async (code) => {
  const [result] = await db.execute(
    `DELETE FROM discount_codes WHERE code = ?`,
    [code],
  );
  return result.affectedRows > 0;
};

const deleteAllDiscountCodes = async () => {
  const [result] = await db.execute(`DELETE FROM discount_codes`);
  return result.affectedRows;
};

const incrementCodeUsage = async (code) => {
  const [result] = await db.execute(
    `UPDATE discount_codes 
     SET used_count = used_count + 1 
     WHERE code = ?`,
    [code],
  );
  return result.affectedRows > 0;
};

const applyDiscountToProduct = async (productId, discountPrice) => {
  const [result] = await db.execute(
    `UPDATE shoes SET discount_price = ? WHERE id = ?`,
    [discountPrice, productId],
  );
  return result.affectedRows > 0;
};

const getProductById = async (productId) => {
  const [rows] = await db.execute(`SELECT * FROM shoes WHERE id = ?`, [
    productId,
  ]);
  return rows[0];
};

const getAllProducts = async () => {
  const [rows] = await db.execute(
    `SELECT id, name, price, discount_price FROM shoes`,
  );
  return rows;
};

const validateDiscountCode = async (code, productId = null) => {
  // Get discount code
  const discountCode = await getDiscountCodeByCode(code);

  if (!discountCode) {
    return {
      valid: false,
      message: "Invalid or expired discount code",
    };
  }

  // If code applies to specific product, validate product
  if (discountCode.applies_to === "specific_product") {
    if (!productId || discountCode.product_id !== parseInt(productId)) {
      return {
        valid: false,
        message: "This discount code is not valid for this product",
      };
    }

    const product = await getProductById(discountCode.product_id);

    return {
      valid: true,
      discount_type: discountCode.discount_type,
      discount_value: discountCode.discount_value,
      product_id: discountCode.product_id,
      product_name: product ? product.name : null,
      original_price: product ? product.price : null,
      current_discount_price: product ? product.discount_price : null,
      code_data: discountCode,
    };
  }

  return {
    valid: true,
    discount_type: discountCode.discount_type,
    discount_value: discountCode.discount_value,
    applies_to: "all_products",
    code_data: discountCode,
  };
};

// اگر به تراکنش نیاز دارید، نسخه‌های با connection:
const setDiscountForAllProductsWithTransaction = async (
  connection,
  discountPercentage,
) => {
  const discountMultiplier = 1 - discountPercentage / 100;
  const [result] = await connection.execute(
    `UPDATE shoes 
     SET discount_price = ROUND(price * ?, 2)
     WHERE discount_price != ROUND(price * ?, 2) OR discount_price IS NULL`,
    [discountMultiplier, discountMultiplier],
  );
  return result.affectedRows;
};

// اضافه کردن متد برای بررسی وجود کد
const checkCodeExists = async (code) => {
  const [rows] = await db.query(
    "SELECT id FROM discount_codes WHERE code = ?",
    [code.toUpperCase()],
  );
  return rows.length > 0;
};

// و بقیه توابع با connection اگر نیاز شد...

module.exports = {
  setDiscountForAllProducts,
  removeDiscountFromAllProducts,
  createDiscountCode,
  getAllDiscountCodes,
  getDiscountCodeByCode,
  getDiscountCodeById,
  deleteDiscountCode,
  deleteAllDiscountCodes,
  incrementCodeUsage,
  applyDiscountToProduct,
  getProductById,
  getAllProducts,
  validateDiscountCode,
  // نسخه‌های با تراکنش
  setDiscountForAllProductsWithTransaction,
  checkCodeExists,
};
