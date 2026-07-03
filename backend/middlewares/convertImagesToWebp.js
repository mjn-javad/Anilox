const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

const isHeic = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return ext === ".heic" || ext === ".heif";
};

const isWebp = (file) => {
  const ext = path.extname(file.filename).toLowerCase();
  return ext === ".webp";
};

const convertOneFile = async (file) => {
  const oldPath = file.path;

  // اگر فایل از اول webp است، اصلاً تبدیل و حذف انجام نده
  if (isWebp(file)) {
    file.mimetype = "image/webp";
    return file;
  }

  const parsed = path.parse(oldPath);
  const newFilename = `${parsed.name}.webp`;
  const newPath = path.join(parsed.dir, newFilename);

  let inputBuffer = await fs.readFile(oldPath);

  if (isHeic(file)) {
    inputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 1,
    });
  }

  await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 1200,
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toFile(newPath);

  // فقط وقتی فایل قدیمی با فایل جدید فرق دارد، فایل قدیمی را حذف کن
  if (oldPath !== newPath) {
    await fs.unlink(oldPath);
  }

  file.filename = newFilename;
  file.path = newPath;
  file.mimetype = "image/webp";
  file.originalname = newFilename;

  return file;
};

exports.convertImagesToWebp = async (req, res, next) => {
  try {
    if (req.file) {
      req.file = await convertOneFile(req.file);
    }

    if (req.files?.length) {
      req.files = await Promise.all(req.files.map(convertOneFile));
    }

    next();
  } catch (err) {
    console.error("Image convert error:", err);

    return res.status(500).json({
      success: false,
      message: "خطا در تبدیل تصویر. لطفاً عکس دیگری انتخاب کنید.",
    });
  }
};
