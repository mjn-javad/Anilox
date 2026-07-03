const multer = require("multer");
const fs = require("fs");
const path = require("path");

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

exports.multerStorage = (destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
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

    uploadFn(req, res, (err) => {
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

      const hasFile = multiple ? req.files?.length > 0 : !!req.file;

      if (!hasFile) {
        return res.status(400).json({
          success: false,
          message: "لطفاً حداقل یک فایل تصویر انتخاب کنید",
        });
      }

      next();
    });
  };
};
