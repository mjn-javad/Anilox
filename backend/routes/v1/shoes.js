const express = require("express");
const controller = require("../../controllers/shoes");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");
const { multerStorage } = require("../../middlewares/uploaderConfig");
const {
  convertImagesToWebp,
} = require("../../middlewares/convertImagesToWebp");

const router = express.Router();

const upload = multerStorage(
  "public/images/posts",
  /jpg|jpeg|webp|png|avif|dng|heic|heif/i,
);

// هندل خطاهای آپلود چند عکس
const uploadImages = (req, res, next) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      console.log("Multer error:", err);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "حجم هر فایل باید کمتر از 10 مگابایت باشد",
        });
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: "نام فیلد فایل اشتباه است. نام درست: images",
        });
      }

      if (err.message === "Invalid file type") {
        return res.status(400).json({
          success: false,
          message:
            "فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPG, JPEG, PNG, WEBP, AVIF, HEIC, HEIF",
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "خطا در آپلود فایل",
      });
    }

    next();
  });
};

// گرفتن همه کفش‌ها
router.get("/", controller.getAllProducts);

// گرفتن یک کفش خاص
router.get("/:id", controller.getSingleProduct);

// ویرایش اطلاعات یک کفش خاص
router.put(
  "/:shoeId/info",
  authMiddleware,
  isAdminMiddleware,
  controller.updateProductInfo,
);

// ویرایش عکس‌های یک کفش خاص
router.put(
  "/:id/images",
  authMiddleware,
  isAdminMiddleware,
  uploadImages,
  convertImagesToWebp,
  controller.updateProductPicture,
);

// ویرایش ترتیب عکس‌ها
router.put(
  "/:shoeId/images/sort-order",
  authMiddleware,
  isAdminMiddleware,
  controller.updateImageSortOrder,
);

// ثبت کفش جدید
router.post(
  "/",
  authMiddleware,
  isAdminMiddleware,
  uploadImages,
  convertImagesToWebp,
  controller.createProduct,
);

// حذف کفش
router.delete(
  "/:id",
  authMiddleware,
  isAdminMiddleware,
  controller.deleteProduct,
);

// افزایش موجودی یک سایز خاص
router.patch(
  "/:shoeId/stock/:size",
  authMiddleware,
  isAdminMiddleware,
  controller.increaseStock,
);

module.exports = router;
