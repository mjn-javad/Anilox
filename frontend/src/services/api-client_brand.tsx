import axios from "axios";

export interface Brand {
  name: string;
  slug: string;
  image: string;
}

const apiClientBrand = axios.create({
  baseURL: "http://localhost:4000/v1/brandPopular",
  withCredentials: true, // ✅ مهم: این گزینه باعث ارسال خودکار کوکی‌ها میشه
});

export default apiClientBrand;
