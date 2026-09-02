const { createHash, timingSafeEqual } = require("crypto");

function createDigest(value) {
  return createHash("sha256").update(value, "utf8").digest();
}

function sendUnauthorized(res) {
  return res.status(401).json({
    success: false,
    message: "Invalid Telegram bot credentials.",
  });
}

module.exports = function telegramBotAuth(req, res, next) {
  try {
    const expectedKey = process.env.TELEGRAM_BOT_SERVICE_KEY?.trim();

    if (!expectedKey) {
      const error = new Error("TELEGRAM_BOT_SERVICE_KEY is not configured.");

      error.statusCode = 500;
      return next(error);
    }

    const providedKey = req.get("x-telegram-bot-key")?.trim();

    if (!providedKey) {
      return sendUnauthorized(res);
    }

    const providedDigest = createDigest(providedKey);

    const expectedDigest = createDigest(expectedKey);

    if (!timingSafeEqual(providedDigest, expectedDigest)) {
      return sendUnauthorized(res);
    }

    req.serviceAuth = Object.freeze({
      type: "telegram-bot",
      scopes: ["product:create"],
    });

    return next();
  } catch (error) {
    return next(error);
  }
};
