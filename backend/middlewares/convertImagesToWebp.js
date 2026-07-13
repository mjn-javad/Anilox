const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

// جلوگیری از اجرای چند پردازش سنگین هم‌زمان
sharp.concurrency(1);

// محدودکردن حافظه کش Sharp
sharp.cache({
  memory: 30,
  files: 10,
  items: 20,
});

const isHeic = (file) => {
  const ext = path.extname(file.originalname || file.filename).toLowerCase();

  return ext === ".heic" || ext === ".heif";
};

const isWebp = (file) => {
  const ext = path.extname(file.filename).toLowerCase();

  return ext === ".webp";
};

const removeFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Remove file error:", error);
    }
  }
};

const convertOneFile = async (file) => {
  const oldPath = file.path;

  // اگر فایل از قبل WebP است، تبدیل نشود
  if (isWebp(file)) {
    file.mimetype = "image/webp";
    return file;
  }

  const parsed = path.parse(oldPath);
  const newFilename = `${parsed.name}.webp`;
  const newPath = path.join(parsed.dir, newFilename);

  try {
    let sharpInput;

    // تبدیل HEIC نیاز به Buffer دارد
    if (isHeic(file)) {
      const heicBuffer = await fs.readFile(oldPath);

      sharpInput = await heicConvert({
        buffer: heicBuffer,
        format: "JPEG",
        quality: 0.9,
      });
    } else {
      // JPG، PNG و AVIF مستقیماً از دیسک خوانده می‌شوند
      sharpInput = oldPath;
    }

    await sharp(sharpInput, {
      sequentialRead: true,
      limitInputPixels: 40000000,
      failOn: "error",
    })
      .rotate()
      .resize({
        width: 1200,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 3,
      })
      .toFile(newPath);

    if (oldPath !== newPath) {
      await removeFile(oldPath);
    }

    return {
      ...file,
      filename: newFilename,
      path: newPath,
      mimetype: "image/webp",
      originalname: newFilename,
    };
  } catch (error) {
    // حذف خروجی ناقص
    if (oldPath !== newPath) {
      await removeFile(newPath);
    }

    throw error;
  }
};

exports.convertImagesToWebp = async (req, res, next) => {
  try {
    if (req.file) {
      req.file = await convertOneFile(req.file);
    }

    if (req.files?.length) {
      const convertedFiles = [];

      // تصاویر یکی‌یکی پردازش می‌شوند، نه هم‌زمان
      for (const file of req.files) {
        const convertedFile = await convertOneFile(file);
        convertedFiles.push(convertedFile);
      }

      req.files = convertedFiles;
    }

    next();
  } catch (error) {
    console.error("Image convert error:", {
      message: error.message,
      stack: error.stack,
    });

    // پاک‌کردن فایل‌های آپلودشده در صورت خطا
    if (req.file?.path) {
      await removeFile(req.file.path);
    }

    if (req.files?.length) {
      for (const file of req.files) {
        await removeFile(file.path);
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "خطا در پردازش تصویر. ممکن است ابعاد یا حجم تصویر بیش از حد بزرگ باشد.",
    });
  }
};
