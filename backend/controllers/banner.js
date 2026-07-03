// controllers/bannerController.js
const Banner = require("../repositories/banner");

// ساخت بنر جدید
exports.createBanner = async (req, res, next) => {
  try {
    const { title1, title2, sort_order = 0 } = req.body;

    let imageName = null;
    if (req.file) {
      imageName = req.file.filename;
    }

    if (!imageName || !title1 || !title2) {
      return res.status(400).json({
        success: false,
        message: "Image, title1 and title2 are required",
      });
    }

    const bannerId = await Banner.create({
      title1,
      title2,
      image: imageName,
    });

    // اگر sort_order داده شده، آپدیت کن
    if (sort_order) {
      await Banner.updateSortOrder(bannerId, sort_order);
    }

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: { id: bannerId, title1, title2, image: imageName },
    });
  } catch (err) {
    next(err);
  }
};

// دریافت همه بنرها
exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getAll();
    return res.status(200).json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

// دریافت یک بنر
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.getById(id);
    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }
    return res.status(200).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

// آپدیت بنر
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title1, title2, is_active, sort_order } = req.body;

    let imageName = null;
    if (req.file) {
      imageName = req.file.filename;
    }

    const updateData = { title1, title2 };
    if (imageName) updateData.image = imageName;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    await Banner.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// حذف بنر
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Banner.delete(id);
    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
