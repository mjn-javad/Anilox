const express = require("express");
const controller = require("../../controllers/auth");
const authMiddlware = require("../../middlewares/auth");
const isAdminMiddlware = require("../../middlewares/isAdmin");
const router = express.Router();

router.get("/me", authMiddlware, controller.getInfo);
router.get("/users", authMiddlware, isAdminMiddlware, controller.getAll);
router.get("/admins", authMiddlware, isAdminMiddlware, controller.getAllAdmins);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/register", controller.register);
router.post("/verify-code", controller.verifyCode);
router.post("/addAddress", authMiddlware, controller.addAddress);
router.get("/addresses", authMiddlware, controller.getAddressByUser);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get(
  "/:userId",
  authMiddlware,
  isAdminMiddlware,
  controller.getSingleUser,
);

router.put(
  "/:userId/admin",
  authMiddlware,
  isAdminMiddlware,
  controller.promoteToAdmin,
);

router.put(
  "/:userId/user",
  authMiddlware,
  isAdminMiddlware,
  controller.preventToUser,
);

router.post(
  "/:userId/ban",
  authMiddlware,
  isAdminMiddlware,
  controller.banUser,
);

router.delete(
  "/:userId/ban",
  authMiddlware,
  isAdminMiddlware,
  controller.deleteBanUser,
);

module.exports = router;
