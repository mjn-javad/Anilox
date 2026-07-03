import React from "react";

const TransactionCard = ({ transaction }) => {
  const totalPrice = parseFloat(transaction.price) * transaction.cart_quantity;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-gray-800">
                {transaction.user_name}
              </h2>

              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {transaction.role}
              </span>
            </div>

            <p className="text-sm text-gray-600">{transaction.email}</p>

            <p className="text-xs text-gray-500">@{transaction.username}</p>
          </div>

          <div className="text-right">
            <div className="font-bold text-green-600">
              ${totalPrice.toLocaleString()}
            </div>

            <div className="text-sm text-gray-500">
              Qty: {transaction.cart_quantity}
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {formatDate(transaction.created_at)}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          {transaction.shoes_name}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Brand:</span>
            <span className="ml-2">{transaction.brand}</span>
          </div>

          <div>
            <span className="text-gray-500">Size:</span>
            <span className="ml-2">{transaction.size}</span>
          </div>

          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-2">
              ${parseFloat(transaction.price).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-gray-500">Discount:</span>
            <span className="ml-2 text-green-600">
              ${parseFloat(transaction.discount_price || 0).toLocaleString()}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-gray-500">Stock:</span>

            <span
              className={`ml-2 ${
                transaction.current_stock > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.current_stock} available
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between border-t">
        <span>User ID: {transaction.user_id}</span>
        <span>Shoe ID: {transaction.shoes_id}</span>
      </div>
    </div>
  );
};

export default TransactionCard;
