const fs = require("fs/promises");
const {
  deleteObjects,
  getMissingConfigKeys,
  isR2Configured,
  productImageKey,
  uploadFile,
} = require("../services/r2Storage");

const removeLocalFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const collectVersions = (file, generatedImage) => {
  if (generatedImage?.versions?.length) return generatedImage.versions;

  return file?.path
    ? [
        {
          filename: file.filename,
          path: file.path,
        },
      ]
    : [];
};

exports.uploadProductImagesToR2 = async (req, res, next) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) return next();

  if (!isR2Configured()) {
    return res.status(503).json({
      success: false,
      message: "Product image storage is not configured",
      missing: getMissingConfigKeys(),
    });
  }

  const uploadedKeys = [];
  const localPaths = files.flatMap((file, index) =>
    collectVersions(file, req.generatedImages?.[index])
      .map((version) => version.path)
      .filter(Boolean),
  );

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const generatedImage = req.generatedImages?.[index];
      const versions = collectVersions(file, generatedImage);
      const fileKeys = [];

      for (const version of versions) {
        const key = productImageKey(version.filename);

        await uploadFile({
          filePath: version.path,
          key,
          contentType: "image/webp",
        });

        uploadedKeys.push(key);
        fileKeys.push(key);
      }

      file.r2Keys = fileKeys;
      file.storage = "r2";
    }

    req.r2UploadedKeys = uploadedKeys;

    // If validation or the database operation later fails, remove orphaned R2 files.
    res.once("finish", () => {
      if (res.statusCode >= 400 && uploadedKeys.length > 0) {
        deleteObjects(uploadedKeys).catch((error) => {
          console.error("R2 rollback error:", error.message);
        });
      }
    });

    for (const filePath of localPaths) {
      await removeLocalFile(filePath);
    }

    return next();
  } catch (error) {
    try {
      await deleteObjects(uploadedKeys);
    } catch (rollbackError) {
      console.error("R2 upload rollback error:", rollbackError.message);
    }

    for (const filePath of localPaths) {
      try {
        await removeLocalFile(filePath);
      } catch (cleanupError) {
        console.error("Temporary image cleanup error:", cleanupError.message);
      }
    }

    console.error("R2 product image upload error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Uploading product images to cloud storage failed",
    });
  }
};
