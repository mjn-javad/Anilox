const db = require("../db");
const User = require("./users");
const Address = require("./address");

const getExecutor = (connection) => {
  return connection ? connection : db;
};

/* ========= CART ========= */

const findCartItemInfo = async (connection, cartItemId, userId) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `SELECT 
      ci.id, 
      ci.product_id,
      ci.stock,
      ci.quantity as cart_quantity,
      COALESCE(sz.quantity, 0) as inStockQuantity
     FROM cart_items ci
     LEFT JOIN product_stocks sz ON ci.product_id = sz.product_id AND ci.stock = sz.stock
     WHERE ci.id = ? AND ci.user_id = ?`,
    [cartItemId, userId],
  );
  return rows[0];
};

const findCartItemById = async (connection, userId, productId, stock) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM cart_items WHERE user_id=? AND product_id=? AND stock=?",
    [userId, productId, stock],
  );
  return rows[0];
};

const insertCartItem = async (connection, userId, productId, stock, quantity) => {
  const executor = getExecutor(connection);
  await executor.execute(
    "INSERT INTO cart_items (user_id, product_id, stock, quantity) VALUES (?,?,?,?)",
    [userId, productId, stock, quantity],
  );

  await executor.execute(
    "UPDATE product_stocks SET quantity = quantity - ? WHERE product_id=? AND stock=?",
    [quantity, productId, stock],
  );
};

const updateCartItemQuantity = async (
  connection,
  cartItemId,
  userId,
  quantity,
  productId,
  stock,
) => {
  const executor = getExecutor(connection);
  await executor.execute(
    "UPDATE cart_items SET quantity = quantity + ? WHERE id=?",
    [quantity, cartItemId],
  );

  await executor.execute(
    "UPDATE product_stocks SET quantity = quantity - ? WHERE product_id=? AND stock=?",
    [quantity, productId, stock],
  );
};

const deleteAllCartItems = async (connection) => {
  const executor = getExecutor(connection);

  // گرفتن تمام آیتم‌ها
  const [cartItems] = await executor.execute(`
    SELECT product_id, stock, quantity
    FROM cart_items
  `);

  // برگرداندن موجودی کفش‌ها
  for (const item of cartItems) {
    await executor.execute(
      `UPDATE product_stocks
       SET quantity = quantity + ?
       WHERE product_id = ? AND stock = ?`,
      [item.quantity, item.product_id, item.stock],
    );
  }

  // حذف کل آیتم‌های کارت
  await executor.execute("DELETE FROM cart_items");
};

const deleteCartItem = async (
  connection,
  userId,
  cartItemId,
  productId,
  stock,
  quantity,
) => {
  const executor = getExecutor(connection);
  await executor.execute("DELETE FROM cart_items WHERE id=? AND user_id=?", [
    cartItemId,
    userId,
  ]);
  await executor.execute(
    "UPDATE product_stocks SET quantity = quantity + ? WHERE product_id=? AND stock=?",
    [quantity, productId, stock],
  );
};

const getAllCarts = async (connection) => {
  const executor = getExecutor(connection);

  const [rows] = await executor.execute(
    `SELECT 
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.stock,
      ci.quantity AS cart_quantity,

      -- user info
      u.name AS user_name,
      u.username,
      u.email,
      u.role,

      -- product info
      s.name AS product_name,
      s.price,
      s.discount_price,
      s.brand,
      s.model,
      s.category,
      s.colors,
      s.created_at,

      -- stock
      COALESCE(sz.quantity, 0) AS current_stock

     FROM cart_items ci

     JOIN users u 
       ON ci.user_id = u.id

     JOIN products s
       ON ci.product_id = s.id

     LEFT JOIN product_stocks sz
       ON s.id = sz.product_id
      AND ci.stock = sz.stock`,
  );

  return rows;
};

const getAllOrders = async (connection) => {
  const executor = getExecutor(connection);

  // ابتدا همه سفارش‌ها را می‌گیریم
  const [orders] = await executor.execute(
    `SELECT 
      o.id,
      o.user_id,
      o.total_price,
      o.price_with_discount,
      o.payment_method,
      o.status,
      o.created_at AS order_date,
      o.address_id,
      
      -- user info
      u.name AS user_name,
      u.username,
      u.email,
      u.role,
      
      -- address info (بر اساس ساختار جدید)
      a.full_name AS address_full_name,
      a.phone AS address_phone,
      a.province,
      a.city,
      a.address AS address_line,
      a.postal_code,
      a.is_default AS address_is_default
      
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN user_addresses a ON o.address_id = a.id
    ORDER BY o.created_at DESC`,
  );

  if (orders.length === 0) {
    return [];
  }

  // برای هر سفارش، آیتم‌های آن را می‌گیریم
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const [items] = await executor.execute(
        `SELECT 
          oi.id,
          oi.product_id,
          oi.stock,
          oi.quantity,
          oi.price_at_purchase,
          
          -- product info
          s.name AS product_name,
          s.brand,
          s.model,
          s.category,
          s.colors,
          s.price AS current_price,
          s.discount_price AS current_discount_price,
          
          -- current stock for this stock
          COALESCE(sz.quantity, 0) AS current_stock
          
        FROM order_items oi
        JOIN products s ON oi.product_id = s.id
        LEFT JOIN product_stocks sz ON s.id = sz.product_id AND oi.stock = sz.stock
        WHERE oi.order_id = ?
        ORDER BY oi.id DESC`,
        [order.id],
      );

      return {
        id: order.id,
        user_id: order.user_id,
        total_price: order.total_price,
        price_with_discount: order.price_with_discount,
        payment_method: order.payment_method,
        status: order.status,
        order_date: order.order_date,
        address_id: order.address_id,

        // user info
        user_name: order.user_name,
        username: order.username,
        email: order.email,
        role: order.role,

        // address info (ساختار جدید)
        address: {
          full_name: order.address_full_name,
          phone: order.address_phone,
          province: order.province,
          city: order.city,
          address_line: order.address_line,
          postal_code: order.postal_code,
          is_default: order.address_is_default,
          full_address:
            `${order.address_line || ""}${order.address_line && order.city ? "، " : ""}${order.city || ""}${order.city && order.province ? "، " : ""}${order.province || ""}${(order.city || order.province) && order.postal_code ? " - " : ""}${order.postal_code ? `کد پستی: ${order.postal_code}` : ""}`.trim(),
        },

        items,
        itemsCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    }),
  );

  return ordersWithItems;
};

const getCartByUser = async (connection, userId) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `SELECT 
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.stock,
      ci.quantity as cart_quantity,
      s.name,
      s.price,
      s.discount_price,
      s.brand,
      s.model,
      s.category,
      s.colors,
      s.created_at,
      (
        SELECT si.image_name 
        FROM product_images si
        WHERE si.product_id = s.id
        LIMIT 1
      ) as image,
      COALESCE(sz.quantity, 0) as current_stock
     FROM cart_items ci
     JOIN products s ON ci.product_id = s.id
     LEFT JOIN product_stocks sz ON s.id = sz.product_id
        AND ci.stock = sz.stock
     WHERE ci.user_id = ?`,
    [userId],
  );
  return rows;
};

/* ===================================================== */
/* محاسبه مجموع کل سبد خرید */
const calculateCartTotals = async (connection, userId) => {
  const executor = getExecutor(connection);

  const [rows] = await executor.execute(
    `
    SELECT 
      /* مجموع بدون تخفیف */
      SUM(s.price * ci.quantity) AS total_price,

      /* مجموع با تخفیف */
      SUM(
        COALESCE(s.discount_price, s.price) * ci.quantity
      ) AS price_with_discount

    FROM cart_items ci
    JOIN products s ON ci.product_id = s.id
    WHERE ci.user_id = ?
    `,
    [userId],
  );

  return rows[0] || { total_price: 0, price_with_discount: 0 };
};

const completeOrder = async (connection, userId, addressId, paymentMethod) => {
  const executor = getExecutor(connection);

  /* 1️⃣ گرفتن آیتم‌های سبد */
  const [cartItems] = await executor.execute(
    `
    SELECT 
      ci.product_id,
      ci.stock,
      ci.quantity,
      s.price,
      s.discount_price
    FROM cart_items ci
    JOIN products s ON ci.product_id = s.id
    WHERE ci.user_id = ?
    `,
    [userId],
  );

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  /* 2️⃣ محاسبه totals */
  let totalPrice = 0;
  let priceWithDiscount = 0;

  for (const item of cartItems) {
    totalPrice += item.price * item.quantity;

    const finalPrice = item.discount_price ?? item.price;

    priceWithDiscount += finalPrice * item.quantity;
  }

  /* 3️⃣ ساخت order */
  const [orderResult] = await executor.execute(
    `
    INSERT INTO orders
    (user_id, address_id, total_price, price_with_discount, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      addressId,
      totalPrice,
      priceWithDiscount,
      paymentMethod,
      "pending",
    ],
  );

  const orderId = orderResult.insertId;

  /* 4️⃣ انتقال به order_items */
  for (const item of cartItems) {
    const finalPrice = item.discount_price ?? item.price;

    await executor.execute(
      `
      INSERT INTO order_items
      (order_id, product_id, stock, quantity,  price_at_purchase)
      VALUES (?, ?, ?, ?, ?)
      `,
      [orderId, item.product_id, item.stock, item.quantity, finalPrice],
    );
  }

  /* 5️⃣ حذف سبد خرید */
  await executor.execute("DELETE FROM cart_items WHERE user_id=?", [userId]);

  return {
    orderId,
    totalPrice,
    priceWithDiscount,
  };
};

const getOrderDetailsForEmail = async (
  connection,
  orderId,
  userId,
  addressId,
  paymentMethod,
) => {
  try {
    // دریافت اطلاعات کاربر
    const user = await User.findById(userId);

    // دریافت آدرس
    const address = await Address.findById(addressId);

    // دریافت محصولات سفارش (فرض بر وجود جدول order_items)
    const [orderItems] = await connection.query(
      `SELECT oi.*, s.name, s.price, s.discount_price
       FROM order_items oi
       JOIN products s ON oi.product_id = s.id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    // دریافت کل مبلغ (اختیاری)
    const [orderTotal] = await connection.query(
      `SELECT price_with_discount FROM orders WHERE id = ?`,
      [orderId],
    );

    const items = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      stock: item.stock || null,
      price: parseFloat(item.price),
      discount_price: parseFloat(item.discount_price),
      total: parseFloat(item.discount_price) * item.quantity,
    }));

    return {
      customerName: user.full_name || user.username,
      customerEmail: user.email,
      orderId: orderId,
      orderDate: new Date().toLocaleDateString("en-US"),
      items: items,
      totalAmount: parseFloat(orderTotal[0].price_with_discount || 0),
      shippingAddress: {
        full_name: address.full_name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
      },
      paymentMethod:
        paymentMethod === "online" ? "Online Payment" : "Cash on Delivery",
    };
  } catch (error) {
    console.error("Error getting order details:", error);
    throw error;
  }
};

module.exports = {
  insertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  getCartByUser,
  completeOrder,
  findCartItemInfo,
  findCartItemById,
  getAllCarts,
  getAllOrders,
  deleteAllCartItems,
  getOrderDetailsForEmail,
};
