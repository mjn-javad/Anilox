const express = require("express");
const controller = require("../../controllers/brandPopular");
const { multerStorage } = require("../../middlewares/uploaderConfig");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

// تنظیم مسیر آپلود برای دسته‌بندی‌ها
const upload = multerStorage("public/images/barnds", /jpg|jpeg|webp|png|avif/);

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdminMiddleware,
  upload.single("image"), // دریافت فقط یک فایل با فیلد 'image'
  controller.createBrand,
);

router.get("/", controller.getAllBrand);

router.get("/bestSellers", controller.getAllBestSeller);

router.post(
  "/bestSellers/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.addProductToBestSellers,
);

router.delete(
  "/bestSellers/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.removeProductFromBestSellers,
);

router.get("/newArrivels", controller.getAllNewArrivel);

router.post(
  "/newArrivels/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.addProductToNewArrivel,
);

router.delete(
  "/newArrivels/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.removeProductFromNewArrivel,
);

module.exports = router;
