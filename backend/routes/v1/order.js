const express = require("express");
const router = express.Router();
const controller = require("../../controllers/order");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

router.post("/cart", authMiddleware, controller.addToCart);
router.get(
  "/allCarts",
  authMiddleware,
  isAdminMiddleware,
  controller.getAllCart,
);
router.delete(
  "/allCarts",
  authMiddleware,
  isAdminMiddleware,
  controller.removeAllCart,
);

router.get("/cart", authMiddleware, controller.getUserCart);
router.delete("/cart/:cartItemId", authMiddleware, controller.removeFromCart);
router.put("/cart/:cartItemId", authMiddleware, controller.editQuantity);
// router.post("/checkout", controller.checkout);

router.post("/orders", authMiddleware, controller.completeOrder);
router.get(
  "/orders",
  authMiddleware,
  isAdminMiddleware,
  controller.getAllOrders,
);

module.exports = router;
