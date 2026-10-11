const fs = require("fs");
const path = require("path");
const db = require("../db");

const SALE_BANNER_SORT_ORDER = 12;
const SALE_BANNER_FILE = "anliox-sale-hero.webp";

async function migrateSaleBanner() {
  const sourceImage = path.resolve(__dirname, "../../frontend/public", SALE_BANNER_FILE);
  const bannerDirectory = path.resolve(__dirname, "../public/images/banners");
  const destinationImage = path.join(bannerDirectory, SALE_BANNER_FILE);

  fs.mkdirSync(bannerDirectory, { recursive: true });
  if (!fs.existsSync(destinationImage)) {
    fs.copyFileSync(sourceImage, destinationImage);
  }

  const [existing] = await db.execute(
    "SELECT id FROM banners WHERE sort_order = ? ORDER BY id ASC LIMIT 1",
    [SALE_BANNER_SORT_ORDER],
  );

  if (existing.length === 0) {
    await db.execute(
      `INSERT INTO banners (
        title1, title2, btnTitle1, btnLink1, btnTitle2, btnLink2,
        bannerLink, image, is_active, sort_order, second_sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        "ANLIOX Sale Hero",
        "",
        "",
        "",
        "",
        "",
        "/sale",
        SALE_BANNER_FILE,
        1,
        SALE_BANNER_SORT_ORDER,
        0,
      ],
    );
    console.log("Sale hero banner created");
  } else {
    console.log(`Sale hero banner already exists (id: ${existing[0].id})`);
  }
}

migrateSaleBanner()
  .catch((error) => {
    console.error("Sale hero banner migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
