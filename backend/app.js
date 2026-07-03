const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoute = require("./routes/v1/auth");
const shoesRoute = require("./routes/v1/shoes");
const ordersRoute = require("./routes/v1/order");
const apidocRoute = require("./routes/v1/apidoc");
const barndPopularRoute = require("./routes/v1/brandPopular");
const bannerRoute = require("./routes/v1/banner");
const discountRouter = require("./routes/v1/discount");

const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const setHeader = require("./middlewares/setHeader");

const app = express();

//* Cors Policy
app.use(setHeader);

// Statics path
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/images", express.static(path.resolve(__dirname, "public/images")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // آدرس فرانت‌اند
    credentials: true, // ✅ مهم
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Secret Key",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

// Routes
app.use("/v1/auth", authRoute);
app.use("/v1/shoes", shoesRoute);
app.use("/v1/orders", ordersRoute);
app.use("/v1/apis", apidocRoute);
app.use("/v1/brandPopular", barndPopularRoute);
app.use("/v1/banner", bannerRoute);
app.use("/v1/discount", discountRouter);

module.exports = app;
