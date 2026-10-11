const BrandPopular = require("../repositories/brandPopular");
const ProductsRepository = require("../repositories/products");
const BestSellers = require("../repositories/bestSellers");
const NewArrivels = require("../repositories/newArrivels");
const Sales = require("../repositories/sales");
const db = require("../db");
const fs = require("fs/promises");
const path = require("path");
const { createBrandSlug } = require("../utils/brandSlug");

const brandImagesDirectory = path.resolve(__dirname, "../public/images/barnds");

const removeImage = async (imagePath) => {
  if (!imagePath) return;
  try {
    await fs.unlink(imagePath);
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Could not remove brand image:", error);
  }
};

const removeStoredBrandImage = (imageName) =>
  imageName
    ? removeImage(path.join(brandImagesDirectory, path.basename(imageName)))
    : Promise.resolve();

const isDuplicateEntryError = (error) => error?.code === "ER_DUP_ENTRY";

exports.createBrand = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
      await removeImage(req.file?.path);
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    const slug = createBrandSlug(name);

    const isBrandExist = await BrandPopular.findBySlug(null, slug);

    if (isBrandExist) {
      await removeImage(req.file?.path);
      return res.status(409).json({ success: false, message: "A brand with this name already exists" });
    }

    let imageName = null;
    if (req.file) {
      imageName = req.file.filename;
    }

    const categoryData = {
      name,
      slug,
      image: imageName,
    };

    const id = await BrandPopular.create(null, categoryData);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: { id, ...categoryData },
    });
  } catch (err) {
    await removeImage(req.file?.path);
    if (isDuplicateEntryError(err)) {
      return res.status(409).json({ success: false, message: "A brand with this name already exists" });
    }
    next(err);
  }
};

exports.getAllBrand = async (req, res, next) => {
  try {
    const brands = await BrandPopular.getAllBrands(null);
    return res.status(200).json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
};

exports.getAllBestSeller = async (req, res, next) => {
  try {
    const { gender, saleOnly } = req.query;
    const result = await ProductsRepository.getAllBestSellers({
      gender,
      saleOnly,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

exports.addProductToBestSellers = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const isProductIdValid = await ProductsRepository.findById(productId);
    if (!isProductIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a product with this id" });
    }

    const isProductAddedBefore = await BestSellers.findByProductId(null, productId);

    if (isProductAddedBefore.length !== 0) {
      return res.status(403).json({
        success: false,
        message: "this product has added to best seller before",
      });
    }
    await BestSellers.create(null, productId);

    return res.status(201).json({
      success: true,
      message: "This product added to bestSellers successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllNewArrivel = async (req, res, next) => {
  try {
    const { gender, saleOnly } = req.query;

    const result = await ProductsRepository.getAllNewArrivals({
      gender,
      saleOnly,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

exports.addProductToNewArrivel = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const isProductIdValid = await ProductsRepository.findById(productId);
    if (!isProductIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a product with this id" });
    }

    const isProductAddedBefore = await NewArrivels.findByProductId(null, productId);
    if (isProductAddedBefore.length !== 0) {
      return res.status(403).json({
        success: false,
        message: "this product has added to new arrivels before",
      });
    }

    await NewArrivels.create(null, productId);

    return res.status(201).json({
      success: true,
      message: "This product added to NewArrivels successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.removeProductFromBestSellers = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const isProductIdValid = await ProductsRepository.findById(productId);
    if (!isProductIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a product with this id" });
    }

    const isProductAddedBefore = await BestSellers.findByProductId(null, productId);
    if (isProductAddedBefore.length === 0) {
      return res.status(403).json({
        success: false,
        message: "this product has not added to new BestSellers before",
      });
    }

    await BestSellers.remove(null, productId);

    return res.status(201).json({
      success: true,
      message: "This product deleted from BestSellers successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.removeProductFromNewArrivel = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const isProductIdValid = await ProductsRepository.findById(productId);
    if (!isProductIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a product with this id" });
    }

    const isProductAddedBefore = await NewArrivels.findByProductId(null, productId);
    if (isProductAddedBefore.length === 0) {
      return res.status(403).json({
        success: false,
        message: "this product has not added to new NewArrivels before",
      });
    }

    await NewArrivels.remove(null, productId);

    return res.status(201).json({
      success: true,
      message: "This product deleted from NewArrivels successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await BrandPopular.findById(null, req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    return res.status(200).json({ success: true, data: brand });
  } catch (err) {
    next(err);
  }
};

exports.updateBrand = async (req, res, next) => {
  let connection;
  let committed = false;
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      await removeImage(req.file?.path);
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    const currentBrand = await BrandPopular.findById(null, req.params.id);
    if (!currentBrand) {
      await removeImage(req.file?.path);
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const slug = createBrandSlug(name);
    const duplicate = await BrandPopular.findBySlug(null, slug);
    if (duplicate && String(duplicate.id) !== String(currentBrand.id)) {
      await removeImage(req.file?.path);
      return res.status(409).json({ success: false, message: "A brand with this name already exists" });
    }

    const image = req.file?.filename || currentBrand.image || null;
    connection = await db.getConnection();
    await connection.beginTransaction();
    await BrandPopular.update(connection, currentBrand.id, { name, slug, image });
    await BrandPopular.updateProductBrandReferences(connection, currentBrand.slug, slug);
    await connection.commit();
    committed = true;

    if (req.file && currentBrand.image !== image) await removeStoredBrandImage(currentBrand.image);
    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: { ...currentBrand, name, slug, image },
    });
  } catch (err) {
    if (connection && !committed) await connection.rollback();
    if (!committed) await removeImage(req.file?.path);
    if (isDuplicateEntryError(err)) {
      return res.status(409).json({ success: false, message: "A brand with this name already exists" });
    }
    next(err);
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllSaleProducts = async (req, res, next) => {
  try {
    const {
      gender,
      type,
      brand,
      page = 1,
      limit = 20,
      inStockOnly = false,
    } = req.query;

    const result = await ProductsRepository.getAll({
      gender,
      type,
      brand,
      page: Number(page),
      limit: Number(limit),
      inStockOnly,
      saleOnly: true,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      brands: result.brands,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

exports.addProductToSale = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await ProductsRepository.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existing = await Sales.findByProductId(null, productId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product is already in sale",
      });
    }

    await Sales.create(null, productId);
    return res.status(201).json({
      success: true,
      message: "Product added to sale successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.removeProductFromSale = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const removed = await Sales.remove(null, productId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Product is not in sale",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from sale successfully",
    });
  } catch (err) {
    next(err);
  }
};
