const configs = require("../configs");
const Users = require("../repositories/users");
const BanUsers = require("../repositories/banUsers");
const NonVerifiedUser = require("../repositories/nonVerifiedUsers");
const Address = require("../repositories/address");
const RefreshTokens = require("../repositories/refreshToken");
const {
  registerValidateSchema,
  loginValidateSchema,
} = require("../validators/auth.validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { RegisterCode } = require("../services/emailService");
const emailService = require("../services/emailService");
const verificationService = require("../services/verificationService");
const PasswordReset = require("../repositories/PasswordRests");

exports.getAll = async (req, res, next) => {
  try {
    const users = await Users.getAll();

    return res.status(202).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const users = await Users.getAllAdmins();

    return res.status(202).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getSingleUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Users.getSingleUser(userId);

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    return res.status(202).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword, name } = req.body;

    // اعتبارسنجی ورودی‌ها
    await registerValidateSchema.validate(
      { email, username, password, confirmPassword, name },
      { abortEarly: false },
    );

    // چک کردن بن بودن ایمیل
    const isEmailBaned = await BanUsers.findByEmail(email);
    if (isEmailBaned) {
      return res.status(404).json({
        success: false,
        message: "This email has been blocked",
      });
    }

    // چک کردن وجود کاربر در Users اصلی
    const isUserRegisteredBefore = await Users.findByUsernameOrEmail({
      username,
      email,
    });

    if (isUserRegisteredBefore) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered",
      });
    }

    // چک کردن وجود کاربر در NonVerifiedUsers
    const existingNonVerified = await NonVerifiedUser.findByEmailOrUsername({
      email,
      username,
    });

    if (existingNonVerified) {
      // حذف رکورد قبلی
      await NonVerifiedUser.deleteById(existingNonVerified.id);
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12);

    // ذخیره در جدول NonVerifiedUsers (با انقضای 10 دقیقه)
    const nonVerifiedUser = await NonVerifiedUser.create({
      email,
      username,
      password: hashedPassword,
      name,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    // تولید کد تأیید
    const verificationCode = verificationService.generateCode();

    // ذخیره کد در Redis
    await verificationService.storeCode(email, verificationCode, 300);

    // ارسال کد به ایمیل
    const resp = await emailService.sendVerificationCode(
      email,
      verificationCode,
    );

    if (!resp.success) {
      return res.status(404).json({
        success: false,
        message: resp.message,
      });
    }

    // ارسال پاسخ موفقیت
    return res.status(200).json({
      success: true,
      message:
        "A verification code has been sent to your email. Please enter the code",
      email: email,
      expiresIn: 600, // 10 دقیقه
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.errors,
      });
    }
    next(err);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    console.log(email, code);

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    // بررسی صحت کد از Redis
    const verificationResult = await verificationService.verifyCode(
      email,
      code,
    );

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // بررسی اعتبار کاربر در NonVerifiedUsers (عدم انقضا)
    const nonVerifiedUser = await NonVerifiedUser.isValid(email);

    if (!nonVerifiedUser) {
      return res.status(404).json({
        success: false,
        message: "User information not found or expired. Please register again",
      });
    }

    // چک کردن مجدد برای جلوگیری از ثبت همزمان
    const isUserRegisteredBefore = await Users.findByUsernameOrEmail({
      username: nonVerifiedUser.username,
      email: nonVerifiedUser.email,
    });

    if (isUserRegisteredBefore) {
      await NonVerifiedUser.deleteByEmail(email);
      return res.status(409).json({
        success: false,
        message: "Username or email is already registered",
      });
    }

    // انتقال کاربر به جدول اصلی Users
    const user = await Users.create({
      name: nonVerifiedUser.name,
      username: nonVerifiedUser.username,
      email: nonVerifiedUser.email,
      password: nonVerifiedUser.password, // از قبل هش شده
    });

    // حذف کاربر از NonVerifiedUsers
    await NonVerifiedUser.deleteByEmail(email);

    // تولید توکن‌ها
    const accessToken = jwt.sign(
      { user_id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      { expiresIn: Number(configs.auth.accessTokenExpiresInSecond) },
    );

    const refreshTokenExpiresInSec = Number(configs.auth.refrshExpiresInSecond);
    const refreshToken = jwt.sign(
      { user_id: user.id, role: user.role },
      configs.auth.refrshTokenSecretKey,
      { expiresIn: refreshTokenExpiresInSec },
    );

    const refreshExpireDate = new Date(
      Date.now() + refreshTokenExpiresInSec * 1000,
    );

    // ذخیره Refresh Token
    await RefreshTokens.create({
      user_id: user.id,
      token: refreshToken,
      expire_time: refreshExpireDate,
    });

    // تنظیم کوکی‌ها
    res.cookie("access-token", accessToken, {
      maxAge: Number(configs.auth.accessTokenExpiresInSecond) * 1000,
      httpOnly: true,
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: refreshTokenExpiresInSec * 1000,
      httpOnly: true,
    });

    // ارسال پاسخ موفقیت
    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    await loginValidateSchema.validate(
      {
        username,
        password,
      },
      { abortEarly: false },
    );

    const user = await Users.findByUsernameOrEmail({ username, email: "" });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isEmailBaned = await BanUsers.findByEmail(user.email);
    if (isEmailBaned) {
      return res.status(404).json({
        success: false,
        message: "This email is baned",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // ---------------- Access Token ----------------
    const accessToken = jwt.sign(
      { user_id: user.id, role: user.role },
      configs.auth.accessTokenSecretKey,
      { expiresIn: Number(configs.auth.accessTokenExpiresInSecond) },
    );

    // ---------------- Refresh Token ----------------
    const refreshTokenExpiresInSec = Number(configs.auth.refrshExpiresInSecond);

    const refreshToken = jwt.sign(
      { user_id: user.id, role: user.role },
      configs.auth.refrshTokenSecretKey,
      { expiresIn: refreshTokenExpiresInSec },
    );

    // تبدیل seconds به تاریخ انقضا
    const refreshExpireDate = new Date(
      Date.now() + refreshTokenExpiresInSec * 1000,
    );

    // ذخیره نسخه واقعی توکن (هش نشده)
    await RefreshTokens.create({
      user_id: user.id,
      token: refreshToken,
      expire_time: refreshExpireDate,
    });

    // ---------------- Cookies ----------------

    res.cookie("access-token", accessToken, {
      maxAge: Number(configs.auth.accessTokenExpiresInSecond) * 1000,
      httpOnly: true,
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: refreshTokenExpiresInSec * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  } catch (err) {
    // خطاهای اعتبارسنجی را جداگانه هندل کنید
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors,
      });
    }

    console.error("Registration error:", err);

    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No refresh token found",
      });
    }

    const isDeleted = await RefreshTokens.deleteByToken(refreshToken);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    res.clearCookie("access-token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      //! Todo
      // sameSite: "strict",
      // secure: process.env.NODE_ENV === "production",
    });

    res.clearCookie("refresh-token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const {
      full_name,
      phone,
      province,
      city,
      address,
      postal_code,
      is_default,
    } = req.body;

    if (!full_name || !phone || !province || !city || !address) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const newAddress = await Address.create({
      user_id,
      full_name,
      phone,
      province,
      city,
      address,
      postal_code,
      is_default,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (err) {
    next(err);
  }
};

exports.promoteToAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Users.promoteToAdmin(userId);

    if (user.affectedRows === 0) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(202)
      .json({ success: true, message: "User promoted to admin" });
  } catch (err) {
    next(err);
  }
};

exports.preventToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const curentUser = req.user;

    if (curentUser.id === parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can not prevent yourself to user",
      });
    }

    const user = await Users.preventToUser(userId);

    if (user.affectedRows === 0) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(202)
      .json({ success: true, message: "Admin prevented to user" });
  } catch (err) {
    next(err);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userIsBaned = await BanUsers.findById(userId);
    if (userIsBaned) {
      return res
        .status(403)
        .json({ success: false, message: "User has baned before" });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    const email = user.email;

    await BanUsers.create({ user_id: userId, email });

    return res
      .status(201)
      .json({ success: true, message: "User baned successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteBanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    const userIsBaned = await BanUsers.findById(userId);
    if (!userIsBaned) {
      return res
        .status(403)
        .json({ success: false, message: "User is not baned" });
    }

    await BanUsers.deleteBanUser(userId);

    return res
      .status(201)
      .json({ success: true, message: "User unBaned successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getInfo = async (req, res, next) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      username: req.user.username,
    };
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getAddressByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.getSingleUser(userId);

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    const userAddresses = await Address.findByUserId(userId);
    return res.status(202).json({ success: true, data: userAddresses });
  } catch (err) {
    next(err);
  }
};

// Step 1: Request password reset
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findByUsernameOrEmail({ username: "", email });

    if (!user) {
      return res.status(200).json({
        message: "If your email is registered, you will receive a reset link",
      });
    }

    // Delete existing tokens
    await PasswordReset.deleteByEmail(email);

    // Generate reset token using JWT
    const resetToken = jwt.sign(
      { email: user.email, user_id: user.id },
      configs.auth.resetPassTokenSecretKey,
      { expiresIn: "1h" },
    );

    // Hash the token for storing in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Calculate expiry date (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save to database
    await PasswordReset.create(email, hashedToken, expiresAt);

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Send email
    await emailService.sendPasswordResetEmail(email, resetLink, user.name);

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    next(err);
  }
};

// Step 2: Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, configs.auth.resetPassTokenSecretKey);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Check if email matches
    if (decoded.email !== email) {
      return res.status(400).json({ message: "Invalid token for this email" });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token in database
    const resetRecord = await PasswordReset.findValidToken(email, hashedToken);

    if (!resetRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Find user
    const user = await Users.findByUsernameOrEmail({ username: "", email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await Users.updatePassword(user.id, hashedPassword);

    // Mark token as used
    await PasswordReset.markAsUsed(resetRecord.id);

    // Delete all tokens for this email
    await PasswordReset.deleteByEmail(email);

    res.status(200).json({
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (err) {
    next(err);
  }
};
