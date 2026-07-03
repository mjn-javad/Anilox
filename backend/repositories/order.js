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
      ci.shoes_id, 
      ci.size, 
      ci.quantity as cart_quantity,
      COALESCE(sz.quantity, 0) as inStockQuantity
     FROM cart_items ci
     LEFT JOIN shoes_sizes sz ON ci.shoes_id = sz.shoes_id AND ci.size = sz.size
     WHERE ci.id = ? AND ci.user_id = ?`,
    [cartItemId, userId],
  );
  return rows[0];
};

const findCartItemById = async (connection, userId, shoesId, size) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    "SELECT * FROM cart_items WHERE user_id=? AND shoes_id=? AND size=?",
    [userId, shoesId, size],
  );
  return rows[0];
};

const insertCartItem = async (connection, userId, shoesId, size, quantity) => {
  const executor = getExecutor(connection);
  await executor.execute(
    "INSERT INTO cart_items (user_id, shoes_id, size, quantity) VALUES (?,?,?,?)",
    [userId, shoesId, size, quantity],
  );

  await executor.execute(
    "UPDATE shoes_sizes SET quantity = quantity - ? WHERE shoes_id=? AND size=?",
    [quantity, shoesId, size],
  );
};

const updateCartItemQuantity = async (
  connection,
  cartItemId,
  userId,
  quantity,
  shoesId,
  size,
) => {
  const executor = getExecutor(connection);
  await executor.execute(
    "UPDATE cart_items SET quantity = quantity + ? WHERE id=?",
    [quantity, cartItemId],
  );

  await executor.execute(
    "UPDATE shoes_sizes SET quantity = quantity - ? WHERE shoes_id=? AND size=?",
    [quantity, shoesId, size],
  );
};

const deleteAllCartItems = async (connection) => {
  const executor = getExecutor(connection);

  // گرفتن تمام آیتم‌ها
  const [cartItems] = await executor.execute(`
    SELECT shoes_id, size, quantity
    FROM cart_items
  `);

  // برگرداندن موجودی کفش‌ها
  for (const item of cartItems) {
    await executor.execute(
      `UPDATE shoes_sizes
       SET quantity = quantity + ?
       WHERE shoes_id = ? AND size = ?`,
      [item.quantity, item.shoes_id, item.size],
    );
  }

  // حذف کل آیتم‌های کارت
  await executor.execute("DELETE FROM cart_items");
};

const deleteCartItem = async (
  connection,
  userId,
  cartItemId,
  shoesId,
  size,
  quantity,
) => {
  const executor = getExecutor(connection);
  await executor.execute("DELETE FROM cart_items WHERE id=? AND user_id=?", [
    cartItemId,
    userId,
  ]);
  await executor.execute(
    "UPDATE shoes_sizes SET quantity = quantity + ? WHERE shoes_id=? AND size=?",
    [quantity, shoesId, size],
  );
};

const getAllCarts = async (connection) => {
  const executor = getExecutor(connection);

  const [rows] = await executor.execute(
    `SELECT 
      ci.id,
      ci.user_id,
      ci.shoes_id,
      ci.size,
      ci.quantity AS cart_quantity,

      -- user info
      u.name AS user_name,
      u.username,
      u.email,
      u.role,

      -- shoes info
      s.name AS shoes_name,
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

     JOIN shoes s 
       ON ci.shoes_id = s.id

     LEFT JOIN shoes_sizes sz 
       ON s.id = sz.shoes_id 
      AND ci.size = sz.size`,
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
          oi.shoes_id,
          oi.size,
          oi.quantity,
          oi.price_at_purchase,
          
          -- shoes info
          s.name AS shoes_name,
          s.brand,
          s.model,
          s.category,
          s.colors,
          s.price AS current_price,
          s.discount_price AS current_discount_price,
          
          -- current stock for this size
          COALESCE(sz.quantity, 0) AS current_stock
          
        FROM order_items oi
        JOIN shoes s ON oi.shoes_id = s.id
        LEFT JOIN shoes_sizes sz ON s.id = sz.shoes_id AND oi.size = sz.size
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
      ci.shoes_id,
      ci.size,
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
        FROM shoes_images si 
        WHERE si.shoes_id = s.id 
        LIMIT 1
      ) as image,
      COALESCE(sz.quantity, 0) as current_stock
     FROM cart_items ci
     JOIN shoes s ON ci.shoes_id = s.id
     LEFT JOIN shoes_sizes sz ON s.id = sz.shoes_id 
        AND ci.size = sz.size 
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
    JOIN shoes s ON ci.shoes_id = s.id
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
      ci.shoes_id,
      ci.size,
      ci.quantity,
      s.price,
      s.discount_price
    FROM cart_items ci
    JOIN shoes s ON ci.shoes_id = s.id
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
      (order_id, shoes_id, size, quantity,  price_at_purchase)
      VALUES (?, ?, ?, ?, ?)
      `,
      [orderId, item.shoes_id, item.size, item.quantity, finalPrice],
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
       JOIN shoes s ON oi.shoes_id = s.id
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
      size: item.size || null,
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
