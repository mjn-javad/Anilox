// controllers/bannerController.js

const Banner = require("../repositories/banner");

const requiredTextFields = ["title1", "bannerLink"];

const getMissingField = (data) => {
  return requiredTextFields.find((field) => {
    const value = data[field];

    return typeof value !== "string" || value.trim() === "";
  });
};

const normalizeSortOrder = (value) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "on"].includes(String(value).toLowerCase());
};

// ساخت بنر جدید
exports.createBanner = async (req, res, next) => {
  try {
    const {
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
      sort_order = 0,
      second_sort_order = 0,
      is_active = true,
    } = req.body;

    const imageName = req.file?.filename || null;

    const bannerData = {
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
    };

    const missingField = getMissingField(bannerData);

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`,
      });
    }

    if (!imageName) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    const newBanner = {
      title1: title1.trim(),
      title2: title2.trim(),
      btnTitle1: btnTitle1.trim(),
      btnLink1: btnLink1.trim(),
      btnTitle2: btnTitle2.trim(),
      btnLink2: btnLink2.trim(),
      bannerLink: bannerLink.trim(),
      image: imageName,
      sort_order: normalizeSortOrder(sort_order),
      second_sort_order: normalizeSortOrder(second_sort_order),
      is_active: normalizeBoolean(is_active, true),
    };

    const bannerId = await Banner.create(newBanner);

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: {
        id: bannerId,
        ...newBanner,
      },
    });
  } catch (err) {
    next(err);
  }
};

// دریافت همه بنرها
exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getAll();

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (err) {
    next(err);
  }
};

// دریافت یک بنر براساس شناسه
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.getById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (err) {
    next(err);
  }
};

// دریافت بنر براساس ترتیب نمایش
exports.getBannerSortOrder = async (req, res, next) => {
  try {
    const { sort_order } = req.params;

    const banner = await Banner.getBySortOrder(sort_order);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (err) {
    next(err);
  }
};

// آپدیت بنر
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
      is_active,
      sort_order,
      second_sort_order,
    } = req.body;

    const currentBanner = await Banner.getById(id);

    if (!currentBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const bannerData = {
      title1,
      title2,
      btnTitle1,
      btnLink1,
      btnTitle2,
      btnLink2,
      bannerLink,
    };

    const missingField = getMissingField(bannerData);

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`,
      });
    }

    const updateData = {
      title1: title1.trim(),
      title2: title2.trim(),
      btnTitle1: btnTitle1.trim(),
      btnLink1: btnLink1.trim(),
      btnTitle2: btnTitle2.trim(),
      btnLink2: btnLink2.trim(),
      bannerLink: bannerLink.trim(),
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    if (is_active !== undefined) {
      updateData.is_active = normalizeBoolean(is_active);
    }

    if (sort_order !== undefined) {
      updateData.sort_order = normalizeSortOrder(sort_order);
    }

    if (second_sort_order !== undefined) {
      updateData.second_sort_order = normalizeSortOrder(second_sort_order);
    }

    await Banner.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: {
        id,
        ...updateData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// حذف بنر
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.getById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await Banner.delete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
