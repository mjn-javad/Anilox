const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const imagesDir = path.join(__dirname, "./public/images/posts");

const sizes = [320, 640, 960];

const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const isGeneratedVersion = (filename) => {
  return /-(320|640|960)\.(webp|jpg|jpeg|png|avif)$/i.test(filename);
};

const createVersions = async () => {
  try {
    const files = await fs.readdir(imagesDir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      // فایل غیر تصویری
      if (!supportedExtensions.includes(ext)) {
        continue;
      }

      // نسخه‌هایی که قبلاً ساختیم دوباره پردازش نشوند
      if (isGeneratedVersion(file)) {
        continue;
      }

      const inputPath = path.join(imagesDir, file);

      const parsed = path.parse(file);

      console.log(`Processing: ${file}`);

      try {
        const metadata = await sharp(inputPath).metadata();

        for (const width of sizes) {
          // اگر عکس اصلی از این سایز کوچکتر است، ردش کن
          if (metadata.width && metadata.width < width) {
            console.log(
              `  Skip ${width}px - original width is ${metadata.width}px`,
            );
            continue;
          }

          const outputFilename = `${parsed.name}-${width}.webp`;

          const outputPath = path.join(imagesDir, outputFilename);

          // اگر قبلاً ساخته شده، دوباره نساز
          try {
            await fs.access(outputPath);

            console.log(`  Exists: ${outputFilename}`);
            continue;
          } catch {
            // فایل وجود ندارد، ساخته شود
          }

          await sharp(inputPath)
            .rotate()
            .resize({
              width,
              withoutEnlargement: true,
            })
            .webp({
              quality: 80,
            })
            .toFile(outputPath);

          console.log(`  Created: ${outputFilename}`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }

    console.log("\n✅ All images processed.");
  } catch (error) {
    console.error("Fatal error:", error);
  }
};

createVersions();
