// pages/Admin/AllCartsPage.jsx
import React from "react";
import TransactionManager from "../../components/Admin/TransactionManagement/TransactionManager";
import apiClientCarts from "../../services/api-client-carts";

const AllCartsPage = () => {
  const transformCartData = (data) => {
    // اگر داده‌ها به فرمت خاصی هستند، اینجا تبدیلشون کن
    // فرض می‌کنیم data یک آرایه از سبدهای خرید است
    return Array.isArray(data) ? data : [];
  };

  return (
    <TransactionManager
      title="All Shopping Carts"
      fetchEndpoint="/allCarts"
      deleteAllEndpoint="/allCarts"
      transactionType="cart"
      apiClient={apiClientCarts}
      transformData={transformCartData}
    />
  );
};

export default AllCartsPage;
