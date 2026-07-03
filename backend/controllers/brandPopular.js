const BrandPopular = require("../repositories/brandPopular");
const ShoesRepository = require("../repositories/shoes");
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
    const result = await ShoesRepository.getAllBestSellers({ gender });

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

exports.addShoeToBestSellers = async (req, res, next) => {
  try {
    const { shoeId } = req.params;

    const isShoeIdValid = await ShoesRepository.findById(shoeId);
    if (!isShoeIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a shoe with this id" });
    }

    const isShoeAddedBefore = await BestSellers.findByShoeId(null, shoeId);

    if (isShoeAddedBefore.length !== 0) {
      return res.status(403).json({
        success: false,
        message: "this shoe has added to best seller before",
      });
    }
    await BestSellers.create(null, shoeId);

    return res.status(201).json({
      success: true,
      message: "This shoe added to bestSellers successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllNewArrivel = async (req, res, next) => {
  try {
    const { gender } = req.query;

    const result = await ShoesRepository.getAllNewArrivals({ gender });

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

exports.addShoeToNewArrivel = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const isShoeIdValid = await ShoesRepository.findById(shoeId);
    if (!isShoeIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a shoe with this id" });
    }

    const isShoeAddedBefore = await NewArrivels.findByShoeId(null, shoeId);
    if (isShoeAddedBefore.length !== 0) {
      return res.status(403).json({
        success: false,
        message: "this shoe has added to new arrivels before",
      });
    }

    await NewArrivels.create(null, shoeId);

    return res.status(201).json({
      success: true,
      message: "This shoe added to NewArrivels successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.removeShoeFromBestSellers = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const isShoeIdValid = await ShoesRepository.findById(shoeId);
    if (!isShoeIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a shoe with this id" });
    }

    const isShoeAddedBefore = await BestSellers.findByShoeId(null, shoeId);
    if (isShoeAddedBefore.length === 0) {
      return res.status(403).json({
        success: false,
        message: "this shoe has not added to new BestSellers before",
      });
    }

    await BestSellers.remove(null, shoeId);

    return res.status(201).json({
      success: true,
      message: "This shoe deleted from BestSellers successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.removeShoeFromNewArrivel = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const isShoeIdValid = await ShoesRepository.findById(shoeId);
    if (!isShoeIdValid) {
      return res
        .status(403)
        .json({ success: false, message: "Can not find a shoe with this id" });
    }

    const isShoeAddedBefore = await NewArrivels.findByShoeId(null, shoeId);
    if (isShoeAddedBefore.length === 0) {
      return res.status(403).json({
        success: false,
        message: "this shoe has not added to new NewArrivels before",
      });
    }

    await NewArrivels.remove(null, shoeId);

    return res.status(201).json({
      success: true,
      message: "This shoe deleted from NewArrivels successfully",
    });
  } catch (err) {
    next(err);
  }
};
