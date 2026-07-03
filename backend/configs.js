require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_BLOG,
  },
  redisDB: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  PORT: process.env.PORT,
  auth: {
    accessTokenSecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    refrshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    resetPassTokenSecretKey: process.env.RESETPASS_TOKEN_SECRET_KEY,
    accessTokenExpiresInSecond: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refrshExpiresInSecond: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  },
};
