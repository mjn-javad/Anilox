import axios from "axios";

const apiClientDiscount = axios.create({
  baseURL: "http://localhost:4000/v1/discount",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientDiscount;
