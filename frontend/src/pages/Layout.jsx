import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import TrustFeatures from "../components/TrustFeature/TrustFeature";
import TrustFeatures2 from "../components/TrustFeature/TrustFeature2";

const Layout = () => {
  const location = useLocation();

  // مسیرهایی که می‌خواهیم بنر (عکس) در NavBar نمایش داده شود
  const routesWithBanner = ["/"];

  // بررسی کنید که آیا مسیر جاری در لیست نمایش بنر قرار دارد
  const shouldShowBanner = routesWithBanner.includes(location.pathname);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 overflow-hidden min-h-screen flex flex-col">
      <NavBar showBanner={shouldShowBanner} />
      <TrustFeatures />
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Outlet />
        </div>
      </main>
      <TrustFeatures2 />
      <Footer />
    </div>
  );
};

export default Layout;
