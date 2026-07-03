import axios from "axios";

const apiClientOrder = axios.create({
  baseURL: "http://localhost:4000/v1/orders",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientOrder;
