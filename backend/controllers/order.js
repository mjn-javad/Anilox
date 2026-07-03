const db = require("../db");
const Order = require("../repositories/order");
const Shoe = require("../repositories/shoes");
const User = require("../repositories/users");
const Address = require("../repositories/address");
const emailService = require("../services/emailService");

/* ========= ADD TO CART ========= */

exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shoesId, size, quantity } = req.body;

    if (!shoesId || !size || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    const shoe = await Shoe.findById(shoesId);
    if (!shoe) {
      return res.status(400).json({
        success: false,
        message: "Can not find this shoe",
      });
    }

    const isThisQuantityInStock =
      shoe.sizes.filter((s) => s.size === size)[0].quantity >= quantity;
    if (!isThisQuantityInStock) {
      return res.status(403).json({
        success: false,
        message:
          "The requested quantity is greater than the available quantity.",
      });
    }

    const existing = await Order.findCartItemById(null, userId, shoesId, size);

    if (existing) {
      const shoesId = existing.shoes_id;
      const size = existing.size;
      await Order.updateCartItemQuantity(
        null,
        existing.id,
        userId,
        quantity,
        shoesId,
        size,
      );
    } else {
      await Order.insertCartItem(null, userId, shoesId, size, quantity);
    }

    res.json({ success: true, message: "Added to cart" });
  } catch (err) {
    next(err);
  }
};

exports.getAllCart = async (req, res, next) => {
  try {
    const allCartItems = await Order.getAllCarts(null);

    res.json({
      success: true,
      data: allCartItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeAllCart = async (req, res, next) => {
  try {
    await Order.deleteAllCartItems(null);
    return res.json({
      success: true,
      message: "All Carts Removed successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* ========= GET CART ========= */

exports.getUserCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      return res
        .status(403)
        .json({ success: false, message: "User is not exist" });
    }

    const cartItems = await Order.getCartByUser(null, userId);

    let totalPrice = 0;
    let totalDiscountPrice = 0;
    cartItems.forEach((item) => {
      totalDiscountPrice += item.discount_price * item.cart_quantity;
      totalPrice += item.price * item.cart_quantity;
    });

    res.json({
      success: true,
      data: cartItems,
      totalPrice,
      totalDiscountPrice,
    });
  } catch (err) {
    next(err);
  }
};

/* ========= REMOVE ========= */

exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
      return res
        .status(403)
        .json({ success: false, message: "User is not exist" });
    }

    const {
      _,
      shoes_id: shoesId,
      size,
      cart_quantity: quantity,
    } = await Order.findCartItemInfo(null, cartItemId, userId);

    if (!shoesId || !size || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cart Item ID",
      });
    }

    await Order.deleteCartItem(
      null,
      userId,
      cartItemId,
      shoesId,
      size,
      quantity,
    );

    return res.json({ success: true, message: "Removed successfully" });
  } catch (err) {
    next(err);
  }
};

/* ========= completeOrder ========= */

exports.completeOrder = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const userId = req.user.id;
    const { address_id, payment_method } = req.body;

    // اعتبارسنجی‌های همزمان با Promise.all برای بهبود performance
    const [user, address] = await Promise.all([
      User.findById(userId),
      Address.findById(address_id),
    ]);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (!address) {
      return res.status(403).json({
        success: false,
        message: "Address not found",
      });
    }

    const allowedPaymentMethod = ["online", "onDelivery"];
    if (!allowedPaymentMethod.includes(payment_method)) {
      return res.status(403).json({
        success: false,
        message: "Payment method not allowed",
      });
    }

    await connection.beginTransaction();

    // تکمیل سفارش
    const result = await Order.completeOrder(
      connection,
      userId,
      address_id,
      payment_method,
    );

    // دریافت اطلاعات کامل سفارش برای ایمیل
    const orderDetails = await Order.getOrderDetailsForEmail(
      connection,
      result.orderId,
      userId,
      address_id,
      payment_method,
    );

    await connection.commit();

    // ارسال ایمیل‌ها به صورت غیرهمزمان (عدم阻塞 پاسخ)
    sendOrderEmails(orderDetails).catch((error) => {
      console.error("Failed to send order emails:", error);
    });

    res.status(201).json({
      success: true,
      message: "Order completed successfully",
      order_id: result.orderId,
      total_price: result.totalPrice,
      price_with_discount: result.priceWithDiscount,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

exports.editQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity, decOrInc } = req.body;

    if (quantity + decOrInc <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please delete this item",
      });
    }

    const existing = await Order.findCartItemInfo(null, cartItemId, userId);

    if (!existing) {
      return res.status(403).json({
        success: false,
        message: "can not find this item in your shop basket",
      });
    } else if (existing.inStockQuantity < decOrInc) {
      return res.status(403).json({
        success: false,
        message:
          "The requested quantity is greater than the available quantity.",
      });
    } else {
      const shoesId = existing.shoes_id;
      const size = existing.size;
      await Order.updateCartItemQuantity(
        null,
        existing.id,
        userId,
        decOrInc,
        shoesId,
        size,
      );
    }

    return res.json({ success: true, message: "edited quantity successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const allOrders = await Order.getAllOrders(null);

    res.json({
      success: true,
      data: allOrders,
    });
  } catch (err) {
    next(err);
  }
};

// متد جداگانه برای ارسال ایمیل‌ها
const sendOrderEmails = async (orderDetails) => {
  try {
    // ارسال هر دو ایمیل به صورت همزمان
    const [customerEmail, adminEmail] = await Promise.allSettled([
      emailService.sendOrderConfirmationEmail(orderDetails),
      emailService.sendNewOrderNotificationToWorker(orderDetails),
    ]);

    const results = {
      customer:
        customerEmail.status === "fulfilled"
          ? customerEmail.value
          : { success: false, error: customerEmail.reason },
      admin:
        adminEmail.status === "fulfilled"
          ? adminEmail.value
          : { success: false, error: adminEmail.reason },
    };

    // لاگ برای مانیتورینگ
    if (!results.customer.success) {
      console.error(
        "Failed to send customer email for order:",
        orderDetails.orderId,
      );
    }
    if (!results.admin.success) {
      console.error(
        "Failed to send admin email for order:",
        orderDetails.orderId,
      );
    }

    return results;
  } catch (error) {
    console.error("Error in sendOrderEmails:", error);
    // عدم throw خطا برای اینکه روی پاسخ اصلی تأثیر نگذارد
    return { success: false, error: error.message };
  }
};
