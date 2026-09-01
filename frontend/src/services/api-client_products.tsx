import axios from "axios";

export interface Brand {
  name: string;
  slug: string;
  image: string;
}

const apiClientProducts = axios.create({
  baseURL: "/api/v1/products",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientProducts;
