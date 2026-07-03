const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_BLOG,
  port: process.env.DB_PORT,

  // *** تنظیمات مهم ***
  waitForConnections: true, // صبر کن تا اتصال آزاد شود
  connectionLimit: 10, // حداکثر تعداد اتصال همزمان
  queueLimit: 0, // بی‌نهایت درخواست را در صف نگه دار

  // charset استاندارد برای فارسی
  charset: "utf8mb4_unicode_ci",
});

// *** تست اتصال ***
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Pool connected successfully!");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = pool;
