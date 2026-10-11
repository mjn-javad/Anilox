const fs = require("fs");
const path = require("path");
const db = require("../db");

async function migrateSaleProducts() {
  const sql = fs.readFileSync(
    path.join(__dirname, "sale_products_ddl.sql"),
    "utf8",
  );

  try {
    await db.query(sql);
    console.log("sale_products migration completed");
  } finally {
    await db.end();
  }
}

migrateSaleProducts().catch((error) => {
  console.error("sale_products migration failed:", error.message);
  process.exitCode = 1;
});
