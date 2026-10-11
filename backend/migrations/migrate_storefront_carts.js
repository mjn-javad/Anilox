const db = require("../db");

async function columnExists(tableName, columnName) {
  const [rows] = await db.execute(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName],
  );
  return rows.length > 0;
}

async function migrate() {
  if (!(await columnExists("cart_items", "storefront"))) {
    await db.query(
      "ALTER TABLE cart_items ADD COLUMN storefront VARCHAR(20) NOT NULL DEFAULT 'main' AFTER quantity",
    );
  }

  if (!(await columnExists("orders", "storefront"))) {
    await db.query(
      "ALTER TABLE orders ADD COLUMN storefront VARCHAR(20) NOT NULL DEFAULT 'main' AFTER payment_method",
    );
  }

  const [indexRows] = await db.query("SHOW INDEX FROM cart_items");
  const indexes = new Map();
  indexRows.forEach((row) => {
    if (row.Key_name === "PRIMARY" || Number(row.Non_unique) !== 0) return;
    if (!indexes.has(row.Key_name)) indexes.set(row.Key_name, []);
    indexes.get(row.Key_name)[Number(row.Seq_in_index) - 1] = row.Column_name;
  });

  const indexNames = new Set(indexRows.map((row) => row.Key_name));
  if (!indexNames.has("cart_items_user_lookup")) {
    await db.query(
      "ALTER TABLE cart_items ADD INDEX cart_items_user_lookup (user_id)",
    );
  }
  if (!indexNames.has("cart_items_product_lookup")) {
    await db.query(
      "ALTER TABLE cart_items ADD INDEX cart_items_product_lookup (product_id)",
    );
  }

  const oldColumns = "user_id,product_id,stock";
  const newColumns = "user_id,product_id,stock,storefront";
  for (const [indexName, columns] of indexes) {
    if (columns.join(",") === oldColumns) {
      await db.query("ALTER TABLE cart_items DROP INDEX ??", [indexName]);
    }
  }

  const [updatedIndexRows] = await db.query("SHOW INDEX FROM cart_items");
  const updatedIndexes = new Map();
  updatedIndexRows.forEach((row) => {
    if (row.Key_name === "PRIMARY" || Number(row.Non_unique) !== 0) return;
    if (!updatedIndexes.has(row.Key_name)) updatedIndexes.set(row.Key_name, []);
    updatedIndexes.get(row.Key_name)[Number(row.Seq_in_index) - 1] = row.Column_name;
  });
  const hasStorefrontUnique = [...updatedIndexes.values()].some(
    (columns) => columns.join(",") === newColumns,
  );
  if (!hasStorefrontUnique) {
    await db.query(
      "ALTER TABLE cart_items ADD UNIQUE KEY cart_user_product_stock_storefront (user_id, product_id, stock, storefront)",
    );
  }

  console.log("storefront cart migration completed");
}

migrate()
  .catch((error) => {
    console.error("storefront cart migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.end());
