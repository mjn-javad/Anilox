import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import WomenHome from "./pages/WomanHome";
import MenHome from "./pages/ManHome";

import ShoeUploader from "./components/Uploader/ShoeUploader";
import BrandUploader from "./components/Uploader/BrandUploader";
import BannerUploader from "./components/Uploader/BannerUploader";

import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import VerifyCode from "./components/Login/VerifyCode";
import ForgotPassword from "./components/Login/ForgotPassword";
import ResetPassword from "./components/Login/ResetPassword";

import SingleShoe from "./components/Slider/SingleShoe";
import SliderShoes from "./components/Slider/SliderShoes";
import SliderNewArrivels from "./components/Slider/SliderNewArrivels";
import SliderBestSellers from "./components/Slider/SliderBestSellers";

import Basket from "./components/Basket/Basket";
import AddressPage from "./components/AddressPage/AddressPage";

import AdminShoesManagement from "./components/AdminShoesManager/AdminShoesManager";
import AdminSingleShoeManagement from "./components/AdminShoesManager/AdminSingleShoeManagment";
import UserManagement from "./components/UserManagment/UserManagment";
import SimpleAllCarts from "./components/SimpleAllCarts";
import CompletedOrdersPage from "./components/CompletedOrdersPage";

import DiscountPriceSetter from "./components/Discount/DiscountPriceSetter";
import DiscountCodeManager from "./components/Discount/DiscountCodeManager";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home Pages */}
          <Route index element={<WomenHome />} />
          <Route path="women" element={<WomenHome />} />
          <Route path="men" element={<MenHome />} />

          {/* Product Pages */}
          <Route path="shoe/:id" element={<SingleShoe />} />
          <Route path="slider-shoes" element={<SliderShoes />} />
          <Route path="new-arrivals" element={<SliderNewArrivels />} />
          <Route path="best-sellers" element={<SliderBestSellers />} />

          {/* Auth Pages */}
          <Route path="LoginLogout" element={<Login />} />
          <Route path="verify" element={<VerifyCode />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* User Pages */}
          <Route path="basket" element={<Basket />} />
          <Route path="address" element={<AddressPage />} />

          {/* Admin Dashboard */}
          <Route path="admin/dashboard" element={<AdminShoesManagement />} />

          <Route
            path="admin/dashboard/shoes-manager"
            element={<AdminShoesManagement />}
          />

          <Route
            path="admin/dashboard/editShoe/:shoeId"
            element={<AdminSingleShoeManagement />}
          />

          <Route
            path="admin/dashboard/users-manager"
            element={<UserManagement />}
          />

          <Route path="admin/dashboard/carts" element={<SimpleAllCarts />} />

          <Route
            path="admin/dashboard/orders"
            element={<CompletedOrdersPage />}
          />

          <Route
            path="admin/dashboard/brand-upload"
            element={<BrandUploader />}
          />

          <Route
            path="admin/dashboard/shoe-upload"
            element={<ShoeUploader />}
          />

          <Route
            path="admin/dashboard/banner-upload"
            element={<BannerUploader />}
          />

          <Route
            path="admin/dashboard/set-discount-prices"
            element={<DiscountPriceSetter />}
          />

          <Route
            path="admin/dashboard/discount-code-manager"
            element={<DiscountCodeManager />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
