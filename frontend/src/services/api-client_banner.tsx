import axios from "axios";

const apiClientBrand = axios.create({
  baseURL: "http://localhost:4000/v1/banner",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientBrand;
