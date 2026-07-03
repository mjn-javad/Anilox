import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClientCart from "../../services/api-client_order";
import MessageAlert from "../Shared/MessageAlert";
import apiClientDiscount from "../../services/api-client_discount";

const Basket = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalDiscountPrice, setFinalDiscountPrice] = useState(0);

  // State برای کد تخفیف
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // دریافت سبد خرید
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiClientCart.get("/cart");

      if (response.data.success) {
        setCartItems(response.data.data || []);
        setFinalPrice(response.data.totalPrice || 0);
        setFinalDiscountPrice(response.data.totalDiscountPrice || 0);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("There was a problem retrieving the shopping cart");
    } finally {
      setLoading(false);
    }
  };

  // حذف آیتم از سبد خرید
  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      setUpdatingItem(cartItemId);
      const response = await apiClientCart.delete(`/cart/${cartItemId}`);

      if (response.data.success) {
        await fetchCart();
        // اگر کد تخفیف اعمال شده بود، پاکش کن
        if (appliedDiscount) {
          setAppliedDiscount(null);
          setDiscountCode("");
        }
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError("There was a problem deleting the product");
    } finally {
      setUpdatingItem(null);
    }
  };

  // به‌روزرسانی تعداد
  const handleUpdateQuantity = async (cartItemId, quantity, decOrInc) => {
    try {
      setUpdatingItem(cartItemId);
      const response = await apiClientCart.put(`/cart/${cartItemId}`, {
        quantity,
        decOrInc,
      });

      if (response.data.success) {
        await fetchCart();
        // اگر کد تخفیف اعمال شده بود، پاکش کن (قیمت‌ها تغییر کرده)
        if (appliedDiscount) {
          setAppliedDiscount(null);
          setDiscountCode("");
          setDiscountMessage("Discount code removed due to cart changes");
        }
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("There was a problem updating the count");
    } finally {
      setUpdatingItem(null);
    }
  };

  // اعتبارسنجی کد تخفیف
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setValidatingDiscount(true);
    setDiscountError("");
    setDiscountMessage("");
    setAppliedDiscount(null);

    try {
      // ارسال کد تخفیف به سرور برای اعتبارسنجی
      const response = await apiClientDiscount.post(
        `/validateDiscountCode/${discountCode.toUpperCase()}`,
      );

      if (response.data.success) {
        const discountData = response.data.data;

        // بررسی اینکه کد برای همه محصولات معتبر است یا خیر
        if (discountData.applies_to === "all_products") {
          setAppliedDiscount({
            code: discountCode.toUpperCase(),
            discount_type: discountData.discount_type,
            discount_value: discountData.discount_value,
            applies_to: "all_products",
            message: `✅ Discount code "${discountCode.toUpperCase()}" applied successfully!`,
          });

          setDiscountMessage(
            `✅ Discount code "${discountCode.toUpperCase()}" applied successfully!`,
          );

          // محاسبه مجدد قیمت‌ها با تخفیف
          const discountPercent =
            discountData.discount_type === "percentage"
              ? discountData.discount_value / 100
              : 0;

          const discountAmount =
            discountData.discount_type === "fixed"
              ? discountData.discount_value
              : 0;

          // بروزرسانی قیمت نهایی با تخفیف
          // توجه: اینجا باید منطق محاسبه تخفیف را بر اساس نوع تخفیف پیاده کنید
          if (discountData.discount_type === "percentage") {
            const newTotal = finalDiscountPrice * (1 - discountPercent);
            setFinalDiscountPrice(newTotal);
          } else if (discountData.discount_type === "fixed") {
            const newTotal = Math.max(0, finalDiscountPrice - discountAmount);
            setFinalDiscountPrice(newTotal);
          }
        } else if (discountData.applies_to === "specific_product") {
          // اگر کد برای محصول خاصی است
          setAppliedDiscount({
            code: discountCode.toUpperCase(),
            discount_type: discountData.discount_type,
            discount_value: discountData.discount_value,
            applies_to: "specific_product",
            product_name: discountData.product_name,
            message: `✅ Discount code "${discountCode.toUpperCase()}" applied to "${discountData.product_name}"!`,
          });

          setDiscountMessage(
            `✅ Discount code "${discountCode.toUpperCase()}" applied to "${discountData.product_name}"!`,
          );

          // محاسبه مجدد قیمت‌ها با تخفیف برای محصول خاص
          // اینجا باید منطق پیاده‌سازی شود
        }
      }
    } catch (err) {
      console.error("Error validating discount:", err);
      if (err.response?.status === 404) {
        setDiscountError("❌ Invalid or expired discount code");
      } else if (err.response?.status === 400) {
        setDiscountError(
          err.response.data.message ||
            "❌ This discount code is not valid for your cart",
        );
      } else {
        setDiscountError(
          "❌ Error validating discount code. Please try again.",
        );
      }
    } finally {
      setValidatingDiscount(false);
    }
  };

  // حذف کد تخفیف اعمال شده
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountMessage("");
    setDiscountError("");
    // بازگردانی قیمت‌ها به حالت اولیه
    fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto my-8 p-4 text-center">
        <div className="text-2xl">Loading shopping cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-8 p-4 text-center">
        <MessageAlert message={error} type="error" />
        <button
          onClick={fetchCart}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          retry
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto my-8 p-4 text-center">
        <div className="text-3xl mb-4">🛒</div>
        <div className="text-2xl text-gray-600 mb-4">
          Your shopping cart is empty.
        </div>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          View products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-8">Shopping cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* لیست محصولات */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* تصویر محصول */}
                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image && (
                    <img
                      src={`/api/images/posts/${item.image}`}
                      alt={item.shoe?.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* اطلاعات محصول */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <Link
                        to={`/shoe/${item.shoe_Id}`}
                        className="text-xl font-bold hover:text-blue-600 transition"
                      >
                        {item?.name}
                      </Link>
                      <p className="text-gray-600">{item?.brand}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                          size: {item.size}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItem === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                    >
                      🗑️ delete
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-4 gap-3">
                    {/* قیمت */}
                    <div>
                      {item.discount_price ? (
                        <div>
                          <span className="text-sm text-gray-500 line-through">
                            ${item?.price}
                          </span>
                          <span className="text-xl font-bold text-green-600 ml-2">
                            ${item?.discount_price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">
                          ${item?.price}
                        </span>
                      )}
                    </div>

                    {/* تعداد */}
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">quantity:</span>
                      <div className="flex items-center gap-2">
                        {item.cart_quantity > 1 && (
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.cart_quantity,
                                -1,
                              )
                            }
                            disabled={updatingItem === item.id}
                            className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                        )}
                        <span className="w-12 text-center font-bold">
                          {item.cart_quantity}
                        </span>

                        {item.current_stock >= 1 && (
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.cart_quantity,
                                +1,
                              )
                            }
                            disabled={updatingItem === item.id}
                            className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>

                    {/* جمع قیمت هر آیتم */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">جمع:</span>
                      <div className="font-bold text-lg">
                        $
                        {(
                          (item.discount_price || item.price) *
                          item.cart_quantity
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* بخش خلاصه سبد خرید */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Shopping Cart Summary</h2>

            {/* بخش اعمال کد تخفیف */}
            <div className="mb-4 p-4 bg-white rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                🏷️ Discount Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter discount code"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm uppercase"
                  disabled={!!appliedDiscount || validatingDiscount}
                />
                {!appliedDiscount ? (
                  <button
                    onClick={handleApplyDiscount}
                    disabled={validatingDiscount || !discountCode.trim()}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                      validatingDiscount || !discountCode.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {validatingDiscount ? "⏳ Checking..." : "Apply"}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* نمایش پیام‌های تخفیف */}
              {discountError && (
                <div className="mt-2 text-sm text-red-600">{discountError}</div>
              )}
              {discountMessage && (
                <div className="mt-2 text-sm text-green-600">
                  {discountMessage}
                </div>
              )}

              {/* نمایش اطلاعات کد اعمال شده */}
              {appliedDiscount && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-green-700">
                      {appliedDiscount.code}
                    </span>
                    <span className="text-gray-600">
                      {appliedDiscount.discount_type === "percentage"
                        ? `${appliedDiscount.discount_value}% off`
                        : `$${appliedDiscount.discount_value} off`}
                    </span>
                  </div>
                  {appliedDiscount.applies_to === "specific_product" && (
                    <div className="text-xs text-gray-500 mt-1">
                      For: {appliedDiscount.product_name}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total sum:</span>
                <span className="line-through">
                  ${finalPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>
                  -${(finalPrice - finalDiscountPrice).toLocaleString()}
                </span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-blue-600">
                  <span>Code discount:</span>
                  <span>
                    {appliedDiscount.discount_type === "percentage"
                      ? `${appliedDiscount.discount_value}%`
                      : `$${appliedDiscount.discount_value}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Amount payable:</span>
                <span className="text-green-600">
                  ${finalDiscountPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link to="/address">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold">
                  Continue the purchase process
                </button>
              </Link>
              <Link
                to="/"
                className="block w-full text-center border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;
