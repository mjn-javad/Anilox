// components/Admin/ShoeManagement/SizesStockManager.jsx
import React, { useState } from "react";

const SizeItem = ({ size, quantity, onAddStock }) => (
  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Size {size}:</span>
      </div>
      <span className="text-gray-600">Stock: {quantity}</span>
    </div>
    <button
      onClick={() => onAddStock(size, quantity)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
    >
      ➕ ➖ Add Or Delete Stock
    </button>
  </div>
);

const AddNewSizeForm = ({ onAddSize, updating }) => {
  const [newSize, setNewSize] = useState({
    size: "",
    quantity: 1,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = () => {
    if (!newSize.size) {
      alert("Please enter a size");
      return;
    }

    onAddSize({
      size: newSize.size,
      quantity: newSize.quantity,
    });

    // ریست فرم بعد از اضافه کردن
    setNewSize({
      size: "",
      quantity: 1,
    });
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Add New Size</h3>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Size (e.g., 40, 41, 42)"
            value={newSize.size}
            onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={newSize.quantity}
            onChange={(e) =>
              setNewSize({
                ...newSize,
                quantity: parseInt(e.target.value) || "",
              })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={updating || !newSize.size}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
        >
          Add Size
        </button>
      </div>
    </div>
  );
};

const SizesStockManager = ({ sizes, onAddStock, onAddNewSize, updating }) => {
  const normalizedSizes =
    Array.isArray(sizes) && sizes?.length > 0 ? sizes : [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Sizes & Stock Management
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Current Inventory
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {normalizedSizes.map((sizeItem, idx) => (
            <SizeItem
              key={`${sizeItem.size}-${idx}`}
              size={sizeItem.size}
              quantity={sizeItem.quantity}
              onAddStock={onAddStock}
            />
          ))}
          {normalizedSizes?.length === 0 && (
            <p className="text-gray-500 text-center py-4">No sizes available</p>
          )}
        </div>
      </div>

      <AddNewSizeForm onAddSize={onAddNewSize} updating={updating} />
    </div>
  );
};

export default SizesStockManager;
