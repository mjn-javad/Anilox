const multer = require("multer");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const IMAGE_MIME_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/dng",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

const IMAGE_EXTENSIONS = /jpg|jpeg|png|webp|avif|dng|heic|heif/i;

// سایزهایی که می‌خواهیم تولید شوند
const IMAGE_SIZES = [320, 640, 960];

/* ================================
   ساخت نسخه‌های مختلف تصویر
================================ */

const createImageVersions = async (file) => {
  const inputPath = file.path;

  const parsed = path.parse(file.filename);

  const generatedImages = [];

  for (const width of IMAGE_SIZES) {
    const filename = `${parsed.name}-${width}.webp`;

    const outputPath = path.join(file.destination, filename);

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

    generatedImages.push({
      width,
      filename,
      path: outputPath,
    });
  }

  await fsPromises.unlink(inputPath);
  return generatedImages;
};

/* ================================
   Multer Storage
================================ */

exports.multerStorage = (destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, {
      recursive: true,
    });
  }

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, destination);
    },

    filename(req, file, cb) {
      const unique = Date.now() + "_" + Math.floor(Math.random() * 1e9);

      const ext = path.extname(file.originalname).toLowerCase();

      cb(null, unique + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

    const mime = file.mimetype?.toLowerCase();

    console.log("Uploaded file:", {
      originalname: file.originalname,
      mimetype: mime,
      ext,
    });

    const isValidExt = IMAGE_EXTENSIONS.test(ext);

    const isValidMime =
      IMAGE_MIME_TYPES.includes(mime) ||
      (mime === "application/octet-stream" && ["heic", "heif"].includes(ext));

    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  return multer({
    storage,

    limits: {
      fileSize: 10 * 1024 * 1024,
    },

    fileFilter,
  });
};

/* ================================
   Upload + Generate Images
================================ */

exports.uploadWithErrorHandler = ({
  uploader,
  fieldName = "image",
  multiple = false,
  maxCount = 10,
}) => {
  return (req, res, next) => {
    const uploadFn = multiple
      ? uploader.array(fieldName, maxCount)
      : uploader.single(fieldName);

    uploadFn(req, res, async (err) => {
      /* =========================
         Multer Errors
      ========================= */

      if (err) {
        console.log("Multer error:", err);

        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "حجم هر فایل باید کمتر از 10 مگابایت باشد",
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: `نام فیلد فایل اشتباه است. نام درست: ${fieldName}`,
          });
        }

        if (err.message === "Invalid file type") {
          return res.status(400).json({
            success: false,
            message:
              "فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: JPG, JPEG, PNG, WEBP, AVIF, HEIC, HEIF",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "خطا در آپلود فایل",
        });
      }

      /* =========================
         Check File
      ========================= */

      const files = multiple ? req.files : req.file ? [req.file] : [];

      if (!files.length) {
        return res.status(400).json({
          success: false,
          message: "لطفاً حداقل یک فایل تصویر انتخاب کنید",
        });
      }

      /* =========================
         Generate 320 / 640 / 960
      ========================= */

      try {
        const generatedImages = [];

        for (const file of files) {
          const originalFilename = file.filename;

          const versions = await createImageVersions(file);

          const small = versions.find((image) => image.width === 320);
          const medium = versions.find((image) => image.width === 640);
          const large = versions.find((image) => image.width === 960);

          generatedImages.push({
            original: originalFilename,
            small: small?.filename,
            medium: medium?.filename,
            large: large?.filename,
            versions,
          });

          // Controller نسخه 960 را به‌عنوان تصویر اصلی ذخیره می‌کند
          file.originalFilename = originalFilename;
          file.filename = large.filename;
          file.path = large.path;
        }

        // در Controller هم قابل استفاده است
        req.generatedImages = generatedImages;

        console.log("Generated images:", generatedImages);

        next();
      } catch (error) {
        console.error("Sharp processing error:", error);

        return res.status(500).json({
          success: false,
          message: "خطا در ساخت نسخه‌های مختلف تصویر",
        });
      }
    });
  };
};
