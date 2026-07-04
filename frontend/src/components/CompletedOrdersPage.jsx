// pages/Admin/CompletedOrdersPage.jsx
import React, { useState, useEffect } from "react";
import apiClientOrders from "../services/api-client_order";

const CompletedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClientOrders
      .get("/orders")
      .then((res) => setOrders(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (orders.length === 0) {
    return <div className="p-6 text-center">No orders found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Completed Orders</h1>
        <p className="text-gray-600">Total: {orders.length} orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            {/* Order Header */}
            <div className="flex justify-between items-start border-b pb-3 mb-3">
              <div>
                <div className="font-bold text-lg">Order #{order.id}</div>
                <div className="text-sm text-gray-600">
                  {new Date(order.order_date).toLocaleDateString("en-US")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{order.user_name}</div>
                <div className="text-sm text-gray-600">{order.email}</div>
              </div>
            </div>

            {/* Address Info */}
            {order.address && order.address.address_line && (
              <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                <div className="font-semibold text-gray-700 mb-1">
                  Delivery Information:
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>👤 {order.address.full_name}</div>
                  <div>📞 {order.address.phone}</div>
                  <div>📍 {order.address.full_address}</div>
                  {order.address.postal_code && (
                    <div>📮 Postal Code: {order.address.postal_code}</div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-2 mb-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-nowrap justify-between items-center text-sm"
                >
                  <div className="flex-1 whitespace-nowrap">
                    <span className="font-medium">{item.shoes_name}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span>Size: {item.size}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 align-middle mx-1"
                      style={{ backgroundColor: item.color_code }}
                    />
                    <span className="text-gray-500 mx-2">|</span>
                    <span>Quantity: {item.quantity}</span>
                  </div>
                  <div className="font-semibold text-green-600 whitespace-nowrap">
                    {item.price_at_purchase * item.quantity} AED
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="border-t pt-3 mt-3 flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <span className="text-sm text-gray-600">Payment: </span>
                  <span className="text-sm font-medium">
                    {order.payment_method === "card" ? "💳 Card" : "💰 Cash"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className="text-sm font-medium text-green-600">
                    {order.status === "pending" ? "⏳ Pending" : "✅ Completed"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Price without discount
                </div>
                <div className="text-sm font-bold text-gray-400 line-through">
                  {order.total_price}
                </div>
                <div className="text-sm text-gray-500">Price with discount</div>
                <div className="text-xl font-bold text-green-600">
                  {order.price_with_discount}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedOrdersPage;
