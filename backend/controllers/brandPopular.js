const BrandPopular = require("../repositories/brandPopular");
const ProductsRepository = require("../repositories/products");
const BestSellers = require("../repositories/bestSellers");
const NewArrivels = require("../repositories/newArrivels");

exports.createBrand = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    const isBrandExist = await BrandPopular.findBySlug(null, slug);

    if (isBrandExist) {
      return res
        .status(403)
        .json({ success: false, message: "This brand Exist with this slug" });
    }

    let imageName = null;
    if (req.file) {
      imageName = req.file.filename;
    }

    const categoryData = {
      name: name || null,
      slug: slug || null,
      image: imageName,
    };

    await BrandPopular.create(null, categoryData);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: categoryData,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBrand = async (req, res, next) => {
  try {
    const brands = await BrandPopular.getAllBrands(null);
    return res.status(201).json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
};

exports.getAllBestSeller = async (req, res, next) => {
  try {
    const { gender } = req.query;
    const result = await ProductsRepository.getAllBestSellers({ gender });

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
    const { gender } = req.query;

    const result = await ProductsRepository.getAllNewArrivals({ gender });

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
