const fs = require("fs");
const db = require("../db");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log(
  "Loaded env:",
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
);

const migrate = async () => {
  const users = fs.readFileSync(path.join(__dirname, "users_ddl.sql"), "utf8");
  const shoes = fs.readFileSync(path.join(__dirname, "shoes_ddl.sql"), "utf8");
  const shoesSizes = fs.readFileSync(
    path.join(__dirname, "shoes_sizes_ddl.sql"),
    "utf8",
  );
  const shoesImages = fs.readFileSync(
    path.join(__dirname, "shoes_images_ddl.sql"),
    "utf8",
  );

  const userAddresses = fs.readFileSync(
    path.join(__dirname, "user_addresses_ddl.sql"),
    "utf8",
  );

  const orders = fs.readFileSync(
    path.join(__dirname, "orders_ddl.sql"),
    "utf8",
  );

  const orderItems = fs.readFileSync(
    path.join(__dirname, "order_items_ddl.sql"),
    "utf8",
  );

  const cartItems = fs.readFileSync(
    path.join(__dirname, "cart_items_ddl.sql"),
    "utf8",
  );
  const refreshTokens = fs.readFileSync(
    path.join(__dirname, "refreshTokens_ddl.sql"),
    "utf8",
  );

  try {
    console.log("Creating tables...");
    await db.query(users);
    await db.query(shoes);
    await db.query(shoesSizes);
    await db.query(shoesImages);
    await db.query(userAddresses);
    await db.query(orders);
    await db.query(orderItems);
    await db.query(cartItems);
    await db.query(refreshTokens);

    console.log("Migration completed!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
};

migrate();
