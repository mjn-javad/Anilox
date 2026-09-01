const db = require("../db");

const tableRenames = [
  ["shoes", "products"],
  ["shoes_images", "product_images"],
  ["shoes_sizes", "product_stocks"],
];

const columnRenames = [
  ["product_images", "shoes_id", "product_id", "INT NOT NULL"],
  ["product_stocks", "shoes_id", "product_id", "INT NOT NULL"],
  ["product_stocks", "size", "stock", "INT NOT NULL"],
  ["cart_items", "shoes_id", "product_id", "INT NOT NULL"],
  ["cart_items", "size", "stock", "INT NOT NULL"],
  ["order_items", "shoes_id", "product_id", "INT NOT NULL"],
  ["order_items", "size", "stock", "INT NOT NULL"],
  ["best_sellers", "shoe_id", "product_id", "INT NOT NULL"],
  ["new_arrivels", "shoe_id", "product_id", "INT NOT NULL"],
];

const indexRenames = [
  ["product_images", "idx_shoes_id", "idx_product_id"],
  ["product_images", "shoes_id", "product_id"],
  ["product_stocks", "unique_shoe_sizer", "unique_product_stock"],
  ["cart_items", "shoes_id", "product_id"],
  ["order_items", "shoes_id", "product_id"],
  ["best_sellers", "shoe_id", "product_id"],
  ["new_arrivels", "shoe_id", "product_id"],
];

const quoteIdentifier = (identifier) => `\`${identifier.replaceAll("`", "``")}\``;

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.execute(
    `SELECT 1
       FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      LIMIT 1`,
    [tableName],
  );

  return rows.length > 0;
};

const columnExists = async (connection, tableName, columnName) => {
  const [rows] = await connection.execute(
    `SELECT 1
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [tableName, columnName],
  );

  return rows.length > 0;
};

const indexExists = async (connection, tableName, indexName) => {
  const [rows] = await connection.execute(
    `SELECT 1
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1`,
    [tableName, indexName],
  );

  return rows.length > 0;
};

const getIndexDefinition = async (connection, tableName, indexName) => {
  const [rows] = await connection.execute(
    `SELECT NON_UNIQUE, COLUMN_NAME
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      ORDER BY SEQ_IN_INDEX`,
    [tableName, indexName],
  );

  if (!rows.length) return null;

  return {
    unique: rows[0].NON_UNIQUE === 0,
    columns: rows.map((row) => row.COLUMN_NAME),
  };
};

const renameTable = async (connection, oldName, newName) => {
  const [hasOldName, hasNewName] = await Promise.all([
    tableExists(connection, oldName),
    tableExists(connection, newName),
  ]);

  if (hasOldName && hasNewName) {
    throw new Error(`Both ${oldName} and ${newName} exist; resolve the conflict first.`);
  }

  if (!hasOldName) return;

  await connection.query(
    `RENAME TABLE ${quoteIdentifier(oldName)} TO ${quoteIdentifier(newName)}`,
  );
  console.log(`Renamed table ${oldName} -> ${newName}`);
};

const renameColumn = async (
  connection,
  tableName,
  oldName,
  newName,
  columnDefinition,
) => {
  if (!(await tableExists(connection, tableName))) return;

  const [hasOldName, hasNewName] = await Promise.all([
    columnExists(connection, tableName, oldName),
    columnExists(connection, tableName, newName),
  ]);

  if (hasOldName && hasNewName) {
    throw new Error(
      `Both ${tableName}.${oldName} and ${tableName}.${newName} exist; resolve the conflict first.`,
    );
  }

  if (!hasOldName) return;

  await connection.query(
    `ALTER TABLE ${quoteIdentifier(tableName)} CHANGE COLUMN ${quoteIdentifier(oldName)} ${quoteIdentifier(newName)} ${columnDefinition}`,
  );
  console.log(`Renamed column ${tableName}.${oldName} -> ${newName}`);
};

const renameIndex = async (connection, tableName, oldName, newName) => {
  if (!(await tableExists(connection, tableName))) return;

  const [hasOldName, hasNewName] = await Promise.all([
    indexExists(connection, tableName, oldName),
    indexExists(connection, tableName, newName),
  ]);

  if (hasOldName && hasNewName) {
    throw new Error(
      `Both ${tableName}.${oldName} and ${tableName}.${newName} exist; resolve the conflict first.`,
    );
  }

  if (!hasOldName) return;

  const definition = await getIndexDefinition(connection, tableName, oldName);
  const uniqueKeyword = definition.unique ? "UNIQUE " : "";
  const columns = definition.columns.map(quoteIdentifier).join(", ");

  await connection.query(
    `ALTER TABLE ${quoteIdentifier(tableName)} DROP INDEX ${quoteIdentifier(oldName)}, ADD ${uniqueKeyword}INDEX ${quoteIdentifier(newName)} (${columns})`,
  );
  console.log(`Renamed index ${tableName}.${oldName} -> ${newName}`);
};

const migrate = async () => {
  const connection = await db.getConnection();

  try {
    for (const [oldName, newName] of tableRenames) {
      await renameTable(connection, oldName, newName);
    }

    for (const [tableName, oldName, newName, columnDefinition] of columnRenames) {
      await renameColumn(
        connection,
        tableName,
        oldName,
        newName,
        columnDefinition,
      );
    }

    for (const [tableName, oldName, newName] of indexRenames) {
      await renameIndex(connection, tableName, oldName, newName);
    }

    console.log("Product schema migration completed successfully.");
  } finally {
    connection.release();
    await db.end();
  }
};

migrate().catch((error) => {
  console.error("Product schema migration failed:", error.message);
  process.exitCode = 1;
});
