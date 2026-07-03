const express = require("express");
const router = express.Router();
const controller = require("../../controllers/discount");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

router.post(
  "/setDiscountPrices",
  authMiddleware,
  isAdminMiddleware,
  controller.setDiscountPrices,
);
router.post(
  "/validateDiscountCode/:code",
  authMiddleware,
  controller.isCodeValid,
);

router.post(
  "/createCodeForAllProducts",
  authMiddleware,
  isAdminMiddleware,
  controller.createCodeForAllProducts,
);

// router.post(
//   "/code/:ProductId",
//   authMiddleware,
//   isAdminMiddleware,
//   controller.createCodeForAProduct,
// );

router.get(
  "/allDiscountCodes",
  authMiddleware,
  isAdminMiddleware,
  controller.getAllCodes,
);

router.delete(
  "/removeAllCodes",
  authMiddleware,
  isAdminMiddleware,
  controller.removeAllCodes,
);

router.delete(
  "/removeSingleCode/:code",
  authMiddleware,
  isAdminMiddleware,
  controller.removeSingleCode,
);

module.exports = router;
