// controllers/discount.js
const db = require("../db");
const Discount = require("../repositories/discount");

const setDiscountPrices = async (req, res) => {
  let connection;
  try {
    const { discountPercentage } = req.body;

    if (
      !discountPercentage ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount percentage. Must be between 0 and 100",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // دیگر نیازی به ارسال connection نیست
    const affectedRows =
      await Discount.setDiscountForAllProducts(discountPercentage);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Discount of ${discountPercentage}% applied to ${affectedRows} products`,
      affectedRows,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error setting discount prices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set discount prices",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const createCodeForAllProducts = async (req, res) => {
  let connection;
  try {
    const {
      code,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({
        success: false,
        message: "Code and discount value are required",
      });
    }

    // بررسی تکراری بودن کد
    const codeExists = await Discount.checkCodeExists(code);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: `The discount code "${code.toUpperCase()}" already exists. Please use a different code.`,
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const codeData = {
      code: code.toUpperCase(),
      discount_type: discount_type || "percentage",
      discount_value,
      applies_to: "all_products",
      max_uses,
      valid_from,
      valid_until,
    };

    const codeId = await Discount.createDiscountCode(codeData);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      codeId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creating discount code for all products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create discount code",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const createCodeForAProduct = async (req, res) => {
  let connection;
  try {
    const { ProductId } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({
        success: false,
        message: "Code and discount value are required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if product exists
    const product = await Discount.getProductById(ProductId);
    if (!product) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const codeData = {
      code: code.toUpperCase(),
      discount_type: discount_type || "percentage",
      discount_value,
      applies_to: "specific_product",
      product_id: ProductId,
      max_uses,
      valid_from,
      valid_until,
    };

    const codeId = await Discount.createDiscountCode(codeData);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      codeId,
      product: product.name,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creating discount code for product:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create discount code",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const getAllCodes = async (req, res) => {
  try {
    // دیگر نیازی به connection جداگانه نیست
    const codes = await Discount.getAllDiscountCodes();

    return res.status(200).json({
      success: true,
      codes,
    });
  } catch (error) {
    console.error("Error getting all discount codes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get discount codes",
      error: error.message,
    });
  }
};

const removeAllCodes = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const affectedRows = await Discount.deleteAllDiscountCodes();

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `All discount codes deleted successfully`,
      affectedRows,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error removing all codes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove all discount codes",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const removeSingleCode = async (req, res) => {
  let connection;
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const deleted = await Discount.deleteDiscountCode(code);

    await connection.commit();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error removing discount code:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove discount code",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const isCodeValid = async (req, res) => {
  try {
    const { code } = req.params;
    const { productId } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    // دیگر نیازی به connection جداگانه نیست
    const validationResult = await Discount.validateDiscountCode(
      code,
      productId,
    );

    return res.status(200).json(validationResult);
  } catch (error) {
    console.error("Error validating discount code:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate discount code",
      error: error.message,
    });
  }
};

module.exports = {
  setDiscountPrices,
  createCodeForAllProducts,
  createCodeForAProduct,
  getAllCodes,
  removeAllCodes,
  removeSingleCode,
  isCodeValid,
};
