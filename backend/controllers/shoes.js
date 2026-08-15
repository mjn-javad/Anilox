const ShoesRepository = require("../repositories/shoes");
const BrandPopular = require("../repositories/brandPopular");
const fs = require("fs").promises;
const path = require("path");
const { date } = require("yup");

exports.createProduct = async (req, res, next) => {
  try {
    const allowedTypes = ["shoe", "belt", "bag", "luggage", "glasses", "watch"];

    const allowedGenders = ["male", "female", "genderless"];

    const allowedCategories = [
      "sneaker",
      "loafer",
      "formal",
      "boot",
      "sandal",
      "sport",
      "classic",
      "flat",
      "heels",
      "other",
    ];

    const {
      type = "shoe",
      brand,
      model,
      category,
      gender,
      price,
      discount_price,
      description,
      colors,
    } = req.body;

    const normalizedType = String(type).trim().toLowerCase();
    const normalizedGender = String(gender || "")
      .trim()
      .toLowerCase();

    const normalizedCategory =
      category === undefined ||
      category === null ||
      String(category).trim() === ""
        ? null
        : String(category).trim().toLowerCase();

    if (!model || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Price and model cannot be empty",
      });
    }

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product type. Allowed values: ${allowedTypes.join(
          ", ",
        )}`,
      });
    }

    if (!allowedGenders.includes(normalizedGender)) {
      return res.status(400).json({
        success: false,
        message: `Invalid gender. Allowed values: ${allowedGenders.join(", ")}`,
      });
    }

    if (normalizedCategory && !allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed values: ${allowedCategories.join(
          ", ",
        )}`,
      });
    }

    const numericPrice = Number(price);
    const numericDiscountPrice =
      discount_price === undefined ||
      discount_price === null ||
      discount_price === ""
        ? null
        : Number(discount_price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (
      numericDiscountPrice !== null &&
      (!Number.isFinite(numericDiscountPrice) || numericDiscountPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be a valid number",
      });
    }

    const processedModel = String(model)
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();

    let colorsString = null;

    if (Array.isArray(colors)) {
      colorsString = colors
        .map((color) => (typeof color === "object" ? color.name : color))
        .filter(Boolean)
        .join(", ");
    } else if (typeof colors === "string") {
      colorsString = colors.trim().replace(/\s*,\s*/g, ", ") || null;
    } else if (colors && typeof colors === "object" && colors.name) {
      colorsString = String(colors.name).trim();
    }

    const name = colorsString
      ? `${processedModel} - ${colorsString}`
      : processedModel;

    const isBrandExist = await BrandPopular.findBySlug(null, brand);

    if (!isBrandExist) {
      return res.status(404).json({
        success: false,
        message: "Cannot find this brand",
      });
    }

    const slug = await generateSlug(name, processedModel, colorsString || "");

    const hasSlugUsed = await ShoesRepository.findBySlug(null, slug);

    if (hasSlugUsed) {
      return res.status(409).json({
        success: false,
        message: "A product with this model and color already exists",
      });
    }

    const imageNames = Array.isArray(req.files)
      ? req.files.map((file) => file.filename)
      : [];

    const shoeId = await ShoesRepository.create({
      type: normalizedType,
      name,
      slug,
      brand,
      model: processedModel,

      // برای محصولات غیر کفش category ذخیره نمی‌شود
      category: normalizedType === "shoe" ? normalizedCategory : null,

      gender: normalizedGender,
      price: numericPrice,
      discount_price: numericDiscountPrice,
      description: description?.trim() || null,
      colors: colorsString,
    });

    if (imageNames.length > 0) {
      await ShoesRepository.addImages(shoeId, imageNames);
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        shoeId,
        model: processedModel,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // بررسی اینکه محصول سفارش دارد یا نه
    const hasOrders = await ShoesRepository.hasOrders(id);

    if (hasOrders) {
      return res.status(409).json({
        success: false,
        message:
          "This product has already been purchased by customers, and deleting it would sever the link between the orders and the product. To preserve order data, this product cannot be deleted.",
      });
    }

    // قبل از حذف محصول، اطلاعات تصاویر را بگیر
    const product = await ShoesRepository.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found.",
      });
    }

    // اسم تصاویر را نگه دار
    const images = Array.isArray(product.images) ? product.images : [];

    // حذف محصول از دیتابیس
    const deleted = await ShoesRepository.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found.",
      });
    }

    // بعد از حذف موفق از دیتابیس، فایل‌ها را از سرور حذف کن
    for (const image of images) {
      const imageName = typeof image === "string" ? image : image?.image_name;

      if (imageName) {
        await deleteImageFiles(imageName);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product Deleted Successfully.",
    });
  } catch (err) {
    next(err);
  }
};

exports.updateShoeStock = async (req, res) => {
  try {
    const { shoeId } = req.params;
    const { size, quantity } = req.body;

    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Size is required",
      });
    }

    const quantityChange = Number(quantity);

    if (!Number.isInteger(quantityChange) || quantityChange === 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-zero integer",
      });
    }

    const updated = await changeStock(shoeId, size, quantityChange);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Shoe size was not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        quantityChange > 0
          ? "Stock increased successfully"
          : "Stock decreased successfully",
    });
  } catch (error) {
    console.error("Update shoe stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shoe stock",
    });
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    let {
      search,
      gender,
      brand,
      model,
      type,
      category,
      sort,
      order,
      discountOnly,
      page = 1,
      limit = 20,
    } = req.query;

    const allowedSortFields = ["price", "created_at", "name"];

    if (!allowedSortFields.includes(sort)) {
      sort = "created_at";
    }

    order = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await ShoesRepository.getAll({
      search,
      type,
      gender,
      brand,
      category,
      discountOnly,
      model,
      sort,
      order,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      brands: result.brands,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSingleProductMeta = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shoe = await ShoesRepository.findById(id);

    if (!shoe) {
      return res.status(404).send("Shoe not found");
    }

    const images = shoe.images || [];
    const firstImage = images[0];

    const imageName =
      typeof firstImage === "string" ? firstImage : firstImage?.image_name;

    let imageUrl = "";

    if (imageName) {
      const imageBaseName = imageName.replace(/\.[^/.]+$/, "");

      imageUrl =
        `http://31.56.178.10/api/images/posts/` + `${imageBaseName}-320.webp`;
    }

    const productId = shoe.id || shoe._id;

    // آدرس واقعی صفحه محصول در Frontend
    const frontendUrl = `https://YOUR-FRONTEND-DOMAIN.com/shoe/${productId}`;

    const price = shoe.discount_price || shoe.price;

    const description = shoe.description || `${shoe.name} - ${price} AED`;

    const escapeHtml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />

          <title>${escapeHtml(shoe.name)}</title>

          <meta
            name="description"
            content="${escapeHtml(description)}"
          />

          <meta
            property="og:type"
            content="product"
          />

          <meta
            property="og:title"
            content="${escapeHtml(shoe.name)}"
          />

          <meta
            property="og:description"
            content="${escapeHtml(description)}"
          />

          <meta
            property="og:image"
            content="${imageUrl}"
          />

          <meta
            property="og:url"
            content="${frontendUrl}"
          />

          <meta
            property="og:site_name"
            content="Anilox Hub"
          />

          <meta
            property="og:image:alt"
            content="${escapeHtml(shoe.name)}"
          />

          <meta
            name="twitter:card"
            content="summary_large_image"
          />

          <meta
            name="twitter:title"
            content="${escapeHtml(shoe.name)}"
          />

          <meta
            name="twitter:description"
            content="${escapeHtml(description)}"
          />

          <meta
            name="twitter:image"
            content="${imageUrl}"
          />

          <meta
            http-equiv="refresh"
            content="0;url=${frontendUrl}"
          />
        </head>

        <body>
          <p>Redirecting...</p>

          <script>
            window.location.replace(
              ${JSON.stringify(frontendUrl)}
            );
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shoe = await ShoesRepository.findById(id);

    if (!shoe) {
      return res.status(404).json({
        success: false,
        message: "Shoe not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: shoe,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProductInfo = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const {
      name,
      model, // مدل کفش
      brand, // برند
      category, // دسته‌بندی
      gender, // جنسیت
      price,
      discountPrice: discount_price,
      description,
      colors, // رشته ساده مثل "قرمز, آبی, مشکی"
      type,
    } = req.body;

    // اعتبارسنجی وجود id
    if (!shoeId) {
      return res.status(400).json({
        success: false,
        message: "Shoe ID is required",
      });
    }

    // اعتبارسنجی داده‌های ورودی
    if (
      !name &&
      !model &&
      !brand &&
      !category &&
      !gender &&
      !price &&
      !discount_price !== undefined &&
      !description &&
      !colors &&
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // ساخت آبجکت اطلاعات برای به‌روزرسانی
    const updateData = {};

    if (name) updateData.name = name;

    // پردازش model: حذف فاصله‌های اضافی و تبدیل به حروف بزرگ
    if (model) {
      updateData.model = model.trim().replace(/\s+/g, " ").toUpperCase();
    }

    if (brand) {
      // بررسی وجود برند
      const isBrandExist = await BrandPopular.findBySlug(null, brand);
      if (!isBrandExist) {
        return res.status(403).json({
          success: false,
          message: "Can not find this brand",
        });
      }
      updateData.brand = brand;
    }

    if (category) updateData.category = category;
    if (gender) updateData.gender = gender;
    if (price !== undefined) updateData.price = price;
    if (discount_price !== undefined)
      updateData.discount_price = discount_price;
    if (description) updateData.description = description;
    if (colors) updateData.colors = colors; // رشته ساده بدون هیچ پردازشی
    if (type) updateData.type = type; // رشته ساده بدون هیچ پردازشی

    // فراخوانی متد آپدیت از ریپازیتوری
    const result = await ShoesRepository.updateShoeInfo(shoeId, updateData);

    // بررسی اینکه آیا کفشی با این ID وجود دارد
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: "Shoe not found or no changes applied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shoe information updated successfully",
      data: {
        ...(updateData.model && { model: updateData.model }),
      },
    });
  } catch (err) {
    next(err);
  }
};

// controllers/shoeController.js
exports.updateImageSortOrder = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const { imageName, sortOrder } = req.body;

    // اعتبارسنجی ورودی‌ها
    if (!shoeId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!imageName) {
      return res.status(400).json({
        success: false,
        message: "Image name is required",
      });
    }

    if (sortOrder === undefined || sortOrder === null) {
      return res.status(400).json({
        success: false,
        message: "Sort order is required",
      });
    }

    // بررسی اینکه sortOrder عدد معتبر است
    const sortOrderNum = parseInt(sortOrder);
    if (isNaN(sortOrderNum) || sortOrderNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Sort order must be a non-negative integer",
      });
    }

    // بررسی وجود کفش
    const shoeExists = await ShoesRepository.findById(shoeId);
    if (!shoeExists) {
      return res.status(404).json({
        success: false,
        message: "Shoe not found",
      });
    }

    // بررسی وجود تصویر
    const imageExists = await ShoesRepository.findImageByName(
      shoeId,
      imageName,
    );

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // به‌روزرسانی sort_order
    await ShoesRepository.updateImageSortOrder(shoeId, imageName, sortOrderNum);

    res.status(200).json({
      success: true,
      message: "Image sort order updated successfully",
      data: {
        shoeId,
        imageName,
        sortOrder: sortOrderNum,
      },
    });
  } catch (err) {
    console.error("Error in updateImageSortOrder:", err);
    next(err);
  }
};

exports.updateProductPicture = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deletedImages } = req.body;
    const newImages = req.files || [];

    if (!id) {
      if (newImages.length > 0) {
        await deleteUploadedFiles(newImages);
      }

      return res.status(400).json({
        success: false,
        message: "Shoe ID is required",
      });
    }

    const shoeExists = await ShoesRepository.findById(id);

    if (!shoeExists) {
      if (newImages.length > 0) {
        await deleteUploadedFiles(newImages);
      }

      return res.status(404).json({
        success: false,
        message: "Shoe not found",
      });
    }

    let deletedImagesList = [];

    if (deletedImages) {
      try {
        if (typeof deletedImages === "string") {
          deletedImagesList = JSON.parse(deletedImages);
        } else if (Array.isArray(deletedImages)) {
          deletedImagesList = deletedImages;
        }

        deletedImagesList = deletedImagesList
          .map((img) => (typeof img === "object" ? img?.image_name : img))
          .filter((img) => typeof img === "string" && img.trim());
      } catch (err) {
        console.error("Error parsing deletedImages:", err);

        deletedImagesList = [];
      }
    }

    // حذف از دیتابیس
    if (deletedImagesList.length > 0) {
      await ShoesRepository.deleteImagesByNames(id, deletedImagesList);
    }

    // اضافه کردن عکس‌های جدید
    if (newImages.length > 0) {
      await ShoesRepository.addImages(id, newImages);
    }

    // حذف فایل اصلی + نسخه‌های 320 / 640 / 960
    if (deletedImagesList.length > 0) {
      for (const imageName of deletedImagesList) {
        await deleteImageFiles(imageName);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Shoe images updated successfully",
    });
  } catch (err) {
    // اگر عملیات DB شکست خورد،
    // تصاویر جدیدی که آپلود شده‌اند پاک شوند
    if (req.files?.length > 0) {
      await deleteUploadedFiles(req.files);
    }

    console.error("Error in updateShoePicture:", err);

    next(err);
  }
};

// تابع کمکی برای حذف فایل‌های آپلود شده
async function deleteUploadedFiles(files) {
  if (!files || files.length === 0) return;

  for (const file of files) {
    try {
      const filePath = path.join(
        __dirname,
        "../public/images/posts",
        file.filename,
      );

      await deleteImageFiles(file.filename);
      // console.log("Deleted:", file.filename);
    } catch (err) {
      console.error(
        "Error deleting uploaded file:",
        file.filename,
        err.message,
      );
    }
  }
}

const generateSlug = (name, model, colors) => {
  // ترکیب نام، مدل و رنگ‌ها
  let slugParts = [];

  if (name) slugParts.push(name);
  if (model) slugParts.push(model);
  if (colors) {
    // اگر colors رشته است و شامل کاما می‌باشد
    const colorArray = colors.split(",").map((c) => c.trim());
    slugParts.push(...colorArray);
  }

  // تبدیل به اسلاگ
  let slug = slugParts
    .join(" ") // اتصال با فاصله
    .toLowerCase() // تبدیل به حروف کوچک
    .trim() // حذف فاصله از اول و آخر
    .replace(/\s+/g, " ") // تبدیل چند فاصله به یک فاصله
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "") // حذف کاراکترهای خاص (فارسی و انگلیسی مجاز)
    .replace(/\s/g, "-") // تبدیل فاصله به خط تیره
    .replace(/-+/g, "-"); // تبدیل چند خط تیره به یک خط تیره

  return slug;
};

const changeStock = async (shoeId, size, quantityChange) => {
  const parsedShoeId = Number(shoeId);
  const parsedQuantity = Number(quantityChange);
  const normalizedSize = String(size).trim();

  if (!Number.isInteger(parsedShoeId) || parsedShoeId <= 0) {
    throw new Error("Invalid shoe ID");
  }

  if (!normalizedSize) {
    throw new Error("Size is required");
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity === 0) {
    throw new Error("Quantity must be a non-zero integer");
  }

  return ShoesRepository.changeStock(
    parsedShoeId,
    normalizedSize,
    parsedQuantity,
  );
};

const deleteImageFiles = async (imageName) => {
  if (!imageName) return;

  const imagesDir = path.join(__dirname, "../public/images/posts");

  const parsed = path.parse(imageName);

  const files = [
    imageName,
    `${parsed.name}-320.webp`,
    `${parsed.name}-640.webp`,
    `${parsed.name}-960.webp`,
  ];

  for (const file of files) {
    try {
      await fs.unlink(path.join(imagesDir, file));

      console.log(`Deleted: ${file}`);
    } catch (err) {
      // اگر فایل وجود نداشت مشکلی نیست
      if (err.code !== "ENOENT") {
        console.error(`Error deleting ${file}:`, err.message);
      }
    }
  }
};
