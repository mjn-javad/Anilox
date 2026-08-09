const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

// چون فایل convertOldImagesToWebp.js داخل ریشه backend است:
const imagesDir = path.join(__dirname, "public/images/posts");

const supportedExtensions = [".jpg", ".jpeg", ".png", ".avif"];

async function convertOldImagesToWebp() {
  try {
    const files = await fs.readdir(imagesDir);

    console.log(`Found ${files.length} files`);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      // فقط فرمت‌هایی که باید تبدیل شوند
      if (!supportedExtensions.includes(ext)) {
        continue;
      }

      const oldPath = path.join(imagesDir, file);

      const parsed = path.parse(file);

      const newFilename = `${parsed.name}.webp`;

      const newPath = path.join(imagesDir, newFilename);

      try {
        // اگر WebP از قبل وجود دارد
        try {
          await fs.access(newPath);

          console.log(`SKIP: ${newFilename} already exists`);

          continue;
        } catch {
          // وجود ندارد، تبدیل را انجام بده
        }

        console.log(`Converting: ${file}`);

        await sharp(oldPath)
          .rotate()
          .webp({
            quality: 85,
          })
          .toFile(newPath);

        console.log(`Created: ${newFilename}`);

        // فقط بعد از موفقیت تبدیل فایل قبلی حذف شود
        await fs.unlink(oldPath);

        console.log(`Deleted old file: ${file}`);
      } catch (error) {
        console.error(`ERROR ${file}:`, error.message);
      }
    }

    console.log("Finished.");
  } catch (error) {
    console.error("Fatal error:", error.message);
  }
}

convertOldImagesToWebp();
