const express = require("express");
const controller = require("../../controllers/products");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

const {
  multerStorage,
  uploadWithErrorHandler,
} = require("../../middlewares/uploaderConfig");
const telegramBotAuth = require("../../middlewares/telegramBotAuth");

const router = express.Router();

const upload = multerStorage("public/images/posts");

const uploadImages = uploadWithErrorHandler({
  uploader: upload,
  fieldName: "images",
  multiple: true,
  maxCount: 10,
});

// گرفتن همه محصولات
router.get("/", controller.getAllProducts);

// گرفتن یک محصول
router.get("/:id", controller.getSingleProduct);

// ویرایش اطلاعات محصول
router.put(
  "/:productId/info",
  authMiddleware,
  isAdminMiddleware,
  controller.updateProductInfo,
);

// ویرایش تصاویر محصول
router.put(
  "/:id/images",
  authMiddleware,
  isAdminMiddleware,
  uploadImages,
  controller.updateProductPicture,
);

// ویرایش ترتیب تصاویر
router.put(
  "/:productId/images/sort-order",
  authMiddleware,
  isAdminMiddleware,
  controller.updateImageSortOrder,
);

// ثبت محصول جدید
router.post(
  "/",
  authMiddleware,
  isAdminMiddleware,
  uploadImages,
  controller.createProduct,
);

router.post(
  "/telegram",
  telegramBotAuth,
  uploadImages,
  controller.createProduct,
);

// حذف محصول
router.delete(
  "/:id",
  authMiddleware,
  isAdminMiddleware,
  controller.deleteProduct,
);

// افزایش موجودی
router.patch(
  "/:productId/stock/:stock",
  authMiddleware,
  isAdminMiddleware,
  controller.updateProductStock,
);

module.exports = router;
