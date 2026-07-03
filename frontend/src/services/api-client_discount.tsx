import axios from "axios";

const apiClientDiscount = axios.create({
  baseURL: "/api/v1/discount",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientDiscount;
