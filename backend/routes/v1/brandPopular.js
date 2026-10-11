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

router.get("/sale", controller.getAllSaleProducts);

router.post(
  "/sale/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.addProductToSale,
);

router.delete(
  "/sale/:productId",
  authMiddleware,
  isAdminMiddleware,
  controller.removeProductFromSale,
);

router.get("/:id", controller.getBrandById);

router.put(
  "/:id",
  authMiddleware,
  isAdminMiddleware,
  upload.single("image"),
  controller.updateBrand,
);

module.exports = router;
