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
  "/bestSellers/:shoeId",
  authMiddleware,
  isAdminMiddleware,
  controller.addShoeToBestSellers,
);

router.delete(
  "/bestSellers/:shoeId",
  authMiddleware,
  isAdminMiddleware,
  controller.removeShoeFromBestSellers,
);

router.get("/newArrivels", controller.getAllNewArrivel);

router.post(
  "/newArrivels/:shoeId",
  authMiddleware,
  isAdminMiddleware,
  controller.addShoeToNewArrivel,
);

router.delete(
  "/newArrivels/:shoeId",
  authMiddleware,
  isAdminMiddleware,
  controller.removeShoeFromNewArrivel,
);

module.exports = router;
