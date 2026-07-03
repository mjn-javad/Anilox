const redis = require("./redis");
const crypto = require("crypto");

class VerificationService {
  // تولید کد تصادفی 6 رقمی
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ذخیره کد در Redis با انقضا (پیش‌فرض 5 دقیقه)
  async storeCode(email, code, expirySeconds = 300) {
    const key = `verification:${email}`;
    await redis.setex(key, expirySeconds, code);
    return true;
  }

  // دریافت کد از Redis
  async getCode(email) {
    const key = `verification:${email}`;
    return await redis.get(key);
  }

  // حذف کد از Redis پس از تأیید
  async deleteCode(email) {
    const key = `verification:${email}`;
    await redis.del(key);
  }

  // بررسی صحت کد
  async verifyCode(email, userCode) {
    const storedCode = await this.getCode(email);
    if (!storedCode) {
      return { success: false, message: "Code expired or does not exist" };
    }

    if (storedCode !== userCode) {
      return { success: false, message: "The code entered is incorrect" };
    }

    await this.deleteCode(email);
    return { success: true, message: "Code verified" };
  }
}

module.exports = new VerificationService();
