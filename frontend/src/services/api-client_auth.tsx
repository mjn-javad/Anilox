import axios from "axios";

const apiClientAuth = axios.create({
  baseURL: "/api/v1/auth",
  withCredentials: true, // مهم: کوکی‌ها رو خودکار ارسال و دریافت می‌کنه
  headers: {
    "Content-Type": "application/json",
  },
});

// اینترسپتور برای هندل کردن خطاها و رفرش خودکار توکن (اختیاری)
// apiClientAuth.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // اگر خطای 401 بود و قبلاً رفرش نکردیم
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // تلاش برای رفرش توکن - کوکی refresh-token خودکار ارسال میشه
//         await apiClientAuth.post("/refresh-token");

//         // تلاش مجدد برای درخواست اصلی
//         return apiClientAuth(originalRequest);
//       } catch (refreshError) {
//         // اگر رفرش هم خطا داد، کاربر رو به لاگین برگردون
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default apiClientAuth;
