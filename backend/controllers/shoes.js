const ShoesRepository = require("../repositories/shoes");
const BrandPopular = require("../repositories/brandPopular");
const fs = require("fs").promises;
const path = require("path");
const { date } = require("yup");

exports.createProduct = async (req, res, next) => {
  try {
    const {
      type,
      brand,
      model, // اضافه شده: مدل کفش
      category = "", // اضافه شده: دسته‌بندی کفش
      gender,
      price,
      discount_price,
      description,
      colors, // ساده شده: یک رشته مثل "قرمز, آبی, مشکی"
    } = req.body;

    // اعتبارسنجی فیلدهای الزامی
    if (!price || !model) {
      return res.status(403).json({
        success: false,
        message: "Price, model can not be empty",
      });
    }

    const name = model + " - " + colors;

    // بررسی وجود برند
    const isBrandExist = await BrandPopular.findBySlug(null, brand);
    if (!isBrandExist) {
      return res.status(403).json({
        success: false,
        message: "Can not find this brand",
      });
    }

    const slug = await generateSlug(name, model, colors);

    // بررسی عدم تکراری بودن slug
    const hasSlugUsed = await ShoesRepository.findBySlug(null, slug);
    if (hasSlugUsed) {
      return res.status(403).json({
        success: false,
        message:
          "This Product with this model and color used before,This slug has been used before",
      });
    }

    // پردازش model: حذف فاصله‌های اضافی و تبدیل به حروف بزرگ
    let processedModel = model
      .trim() // حذف فاصله از اول و آخر
      .replace(/\s+/g, " ") // تبدیل چند فاصله به یک فاصله
      .toUpperCase(); // تبدیل به حروف بزرگ

    // استخراج نام فایل‌ها از req.files
    let imageNames = [];
    if (req.files && req.files.length > 0) {
      imageNames = req.files.map((file) => file.filename);
    }

    // پردازش colors (به صورت رشته ساده)
    let colorsString = null;
    if (colors) {
      // اگر colors به صورت آرایه آمده، آن را به رشته تبدیل کن
      if (Array.isArray(colors)) {
        colorsString = colors.join(", ");
      }
      // اگر به صورت رشته است، فاصله‌های اضافی را حذف کن
      else if (typeof colors === "string") {
        colorsString = colors.trim().replace(/\s*,\s*/g, ", "); // استانداردسازی کاماها
      }
      // اگر به صورت آبجکت است (برای سازگاری با کلاینت‌های قدیمی)
      else if (typeof colors === "object") {
        if (colors.name) {
          colorsString = colors.name;
        } else if (Array.isArray(colors)) {
          colorsString = colors.map((c) => c.name || c).join(", ");
        }
      }
    }

    // ایجاد کفش جدید
    const shoeId = await ShoesRepository.create({
      type,
      name,
      slug,
      brand,
      model: processedModel, // مدل پردازش شده
      category, // دسته‌بندی
      gender,
      price,
      discount_price: discount_price || null,
      description: description || null,
      colors: colorsString, // رنگ به صورت رشته ساده
    });

    // ذخیره نام فایل‌ها در دیتابیس
    if (imageNames.length > 0) {
      await ShoesRepository.addImages(shoeId, imageNames);
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        shoeId,
        model: processedModel, // برگرداندن مدل پردازش شده برای اطلاع کلاینت
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // const isShoeIdValid = await ShoesRepository.findById(id);
    // if (!isShoeIdValid) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Can not find a shoe with this id" });
    // }

    const deleted = await ShoesRepository.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Shoe not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shoe deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.increaseStock = async (req, res, next) => {
  try {
    const { shoeId } = req.params;
    const { size, quantity } = req.body;

    // اعتبارسنجی
    if (!shoeId || !size || !quantity) {
      return res.status(403).json({
        success: false,
        message: "shoeId, size, quantity are required",
      });
    }

    // if (quantity <= 0) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Quantity must be greater than 0",
    //   });
    // }

    // بررسی وجود کفش
    const isShoeIdValid = await ShoesRepository.findById(shoeId);
    if (!isShoeIdValid) {
      return res.status(403).json({
        success: false,
        message: "Cannot find a shoe with this id",
      });
    }

    // اگر رکورد وجود نداشت، آن را ایجاد کن
    await ShoesRepository.addSize(shoeId, size, quantity);

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (err) {
    next(err);
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
      pagination: result.pagination,
    });
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

    // اعتبارسنجی وجود id
    if (!id) {
      if (newImages.length > 0) {
        await deleteUploadedFiles(newImages);
      }
      return res.status(400).json({
        success: false,
        message: "Shoe ID is required",
      });
    }

    // بررسی وجود کفش از طریق ریپازیتوری
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

    // پردازش تصاویر حذف شده
    if (deletedImages) {
      try {
        // اگر string بود parse کن
        if (typeof deletedImages === "string") {
          deletedImagesList = JSON.parse(deletedImages);
        } else if (Array.isArray(deletedImages)) {
          deletedImagesList = deletedImages;
        } else {
          deletedImagesList = [];
        }

        // تمیز کردن و استخراج image_name اگر object است
        deletedImagesList = deletedImagesList
          .filter((img) => img != null && img !== undefined)
          .map((img) => {
            // اگر object است و property image_name دارد
            if (typeof img === "object" && img.image_name) {
              return img.image_name;
            }
            // اگر string است
            if (typeof img === "string") {
              return img;
            }
            return null;
          })
          .filter((img) => img && typeof img === "string");
      } catch (e) {
        console.error("Error parsing deletedImages:", e);
        deletedImagesList = [];
      }

      // حذف تصاویر از دیتابیس
      if (deletedImagesList.length > 0) {
        await ShoesRepository.deleteImagesByNames(id, deletedImagesList);
      }
    }

    // اضافه کردن تصاویر جدید
    let addedImages = [];
    if (newImages && newImages.length > 0) {
      addedImages = await ShoesRepository.addImages(id, newImages);
    }

    // حذف فایل‌های فیزیکی از سرور (بعد از موفقیت دیتابیس)
    if (deletedImagesList.length > 0) {
      for (const imageName of deletedImagesList) {
        // اطمینان از اینکه imageName string است
        if (typeof imageName === "string" && imageName.trim()) {
          const imagePath = path.join(
            __dirname,
            "../public/images/posts",
            imageName,
          );
          try {
            await fs.unlink(imagePath);
            // console.log(`Deleted file: ${imageName}`);
          } catch (err) {
            console.error(`Failed to delete image file: ${imageName}`, err);
          }
        } else {
          console.error(`Invalid image name: ${imageName}`);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Shoe images updated successfully",
    });
  } catch (err) {
    // پاک کردن فایل‌های آپلود شده در صورت خطا
    if (req.files && req.files.length > 0) {
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

      await fs.unlink(filePath);

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
