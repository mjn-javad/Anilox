const jwt = require("jsonwebtoken");
const authRepo = require("../repositories/users");
const refreshTokenRepo = require("../repositories/refreshToken");
const configs = require("../configs");

module.exports = async (req, res, next) => {
  try {
    // ۱. استخراج توکن‌ها (اولویت با Header برای API و سپس Cookie)
    const authHeader = req.headers["authorization"];
    const accessToken =
      (authHeader && authHeader.split(" ")[1]) || req.cookies["access-token"];
    const refreshToken =
      req.headers["x_refresh_token"] || req.cookies["refresh-token"];

    // ۲. اگر اکسس توکن نبود، مستقیم برو سراغ بررسی رفرش توکن
    if (!accessToken) {
      return handleRefreshOrLogin(req, res, next, refreshToken);
    }

    try {
      // ۳. تایید صحت اکسس توکن با کلید موجود در Configs
      const payload = jwt.verify(
        accessToken,
        configs.auth.accessTokenSecretKey,
      );

      // پیدا کردن کاربر با استفاده از ID موجود در توکن
      const user = await authRepo.findById(payload.user_id);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found." });
      }

      req.user = user;
      return next();
    } catch (err) {
      // ۴. اگر منقضی شده یا نامعتبر بود، شانس مجدد با رفرش توکن
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        return handleRefreshOrLogin(req, res, next, refreshToken);
      }
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed." });
    }
  } catch (err) {
    next(err);
  }
};

async function handleRefreshOrLogin(req, res, next, refreshToken) {
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Session expired. No refresh token provided.",
    });
  }

  try {
    // ۵. پیدا کردن رفرش توکن در دیتابیس (استفاده از متد findOne ریپازیتوری شما)
    const stored = await refreshTokenRepo.findOne({ token: refreshToken });

    if (!stored) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please login again.",
      });
    }

    // ۶. بررسی انقضای زمانی رفرش توکن
    if (new Date() > new Date(stored.expire_time)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired. Please login again.",
      });
    }

    // ۷. پیدا کردن کاربر صاحب توکن
    const user = await authRepo.findById(stored.user_id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    // ۸. تولید اکسس توکن جدید
    const newAccessToken = jwt.sign(
      { user_id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      { expiresIn: Number(configs.auth.accessTokenExpiresInSecond) },
    );

    // ۹. ست کردن مجدد کوکی (برای کلاینت‌های تحت مرورگر)
    res.cookie("access-token", newAccessToken, {
      maxAge: Number(configs.auth.accessTokenExpiresInSecond) * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

    // ۱۰. ارسال توکن در هدر پاسخ (برای تست در Postman)
    res.setHeader("x_new_access_token", newAccessToken);

    req.user = user;
    return next();
  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(401).json({
      success: false,
      message: "Authentication process failed.",
      error: err.message,
    });
  }
}
