const express = require("express");
const controller = require("../../controllers/banner");
const { multerStorage } = require("../../middlewares/uploaderConfig");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

// تنظیم مسیر آپلود برای دسته‌بندی‌ها
const upload = multerStorage("public/images/banners", /jpg|jpeg|webp|png|avif/);

const router = express.Router();

router.get("/", controller.getAllBanners);
router.get("/:sort_order", controller.getBannerSortOrder);

router.post(
  "/",
  authMiddleware,
  isAdminMiddleware,
  upload.single("image"), // دریافت فقط یک فایل با فیلد 'image'
  controller.createBanner,
);

router.put("/:id", upload.single("image"), controller.updateBanner);
router.delete("/:id", controller.deleteBanner);

module.exports = router;
