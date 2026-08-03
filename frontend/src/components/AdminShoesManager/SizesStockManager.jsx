// components/Admin/ShoeManagement/SizesStockManager.jsx

import React, { useState } from "react";

const SizeItem = ({
  size,
  quantity,
  onChangeStock,
  onDeleteSize,
  updating,
}) => {
  const [changeAmount, setChangeAmount] = useState(1);

  const currentQuantity = Number(quantity) || 0;
  const numericAmount = Number(changeAmount);

  const validateAmount = () => {
    if (!Number.isInteger(numericAmount) || numericAmount < 1) {
      alert("Please enter a valid quantity");
      return false;
    }

    return true;
  };

  const handleIncrease = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (updating || !validateAmount()) return;

    const success = await onChangeStock(size, numericAmount);

    if (success) {
      setChangeAmount(1);
    }
  };

  const handleDecrease = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (updating || !validateAmount()) return;

    if (numericAmount > currentQuantity) {
      alert(
        `You cannot reduce more than the current stock (${currentQuantity})`,
      );
      return;
    }

    const success = await onChangeStock(size, -numericAmount);

    if (success) {
      setChangeAmount(1);
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (updating) return;

    const confirmed = window.confirm(
      `Do you want to delete size ${size} completely?`,
    );

    if (!confirmed) return;

    await onDeleteSize(size);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">Size {size}</span>

        <span className="text-gray-600">
          Stock:
          <span className="ml-1 font-bold text-gray-900">
            {currentQuantity}
          </span>
        </span>
      </div>

      <input
        type="number"
        min="1"
        step="1"
        value={changeAmount}
        disabled={updating}
        placeholder="Enter quantity"
        onChange={(event) => setChangeAmount(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        className="
          w-full rounded-lg border border-gray-300 px-3 py-2
          focus:border-blue-500 focus:outline-none
          focus:ring-2 focus:ring-blue-200
          disabled:cursor-not-allowed disabled:bg-gray-100
        "
      />

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleIncrease}
          disabled={updating}
          className="
            rounded-lg bg-green-500 px-3 py-2 text-white
            transition-colors hover:bg-green-600
            disabled:cursor-not-allowed disabled:bg-gray-400
          "
        >
          + Add
        </button>

        <button
          type="button"
          onClick={handleDecrease}
          disabled={updating || currentQuantity <= 0}
          className="
            rounded-lg bg-orange-500 px-3 py-2 text-white
            transition-colors hover:bg-orange-600
            disabled:cursor-not-allowed disabled:bg-gray-400
          "
        >
          − Reduce
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={updating}
          className="
            rounded-lg bg-red-500 px-3 py-2 text-white
            transition-colors hover:bg-red-600
            disabled:cursor-not-allowed disabled:bg-gray-400
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const AddNewSizeForm = ({ onAddSize, updating }) => {
  const [newSize, setNewSize] = useState({
    size: "",
    quantity: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const size = String(newSize.size).trim();
    const quantity = Number(newSize.quantity);

    if (!size) {
      alert("Please enter a size");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    const success = await onAddSize({
      size,
      quantity,
    });

    if (success) {
      setNewSize({
        size: "",
        quantity: 1,
      });
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="mb-3 text-lg font-semibold text-gray-700">Add New Size</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Size (e.g. 40, 41, 42)"
            value={newSize.size}
            disabled={updating}
            onChange={(event) =>
              setNewSize((previous) => ({
                ...previous,
                size: event.target.value,
              }))
            }
            className="
              rounded-lg border border-gray-300 px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100
            "
          />

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
            value={newSize.quantity}
            disabled={updating}
            onChange={(event) =>
              setNewSize((previous) => ({
                ...previous,
                quantity: event.target.value,
              }))
            }
            className="
              rounded-lg border border-gray-300 px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100
            "
          />
        </div>

        <button
          type="submit"
          disabled={updating || !String(newSize.size).trim()}
          className="
            w-full rounded-lg bg-blue-500 px-4 py-2 text-white
            transition-colors hover:bg-blue-600
            disabled:cursor-not-allowed disabled:bg-gray-400
          "
        >
          {updating ? "Updating..." : "Add New Size"}
        </button>
      </form>
    </div>
  );
};

const SizesStockManager = ({
  sizes = [],
  onChangeStock,
  onDeleteSize,
  onAddNewSize,
  updating = false,
}) => {
  const normalizedSizes = Array.isArray(sizes) ? sizes : [];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Sizes & Stock Management
      </h2>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          Current Inventory
        </h3>

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {normalizedSizes.map((sizeItem) => (
            <SizeItem
              key={String(sizeItem.size)}
              size={sizeItem.size}
              quantity={sizeItem.quantity}
              onChangeStock={onChangeStock}
              onDeleteSize={onDeleteSize}
              updating={updating}
            />
          ))}

          {normalizedSizes.length === 0 && (
            <p className="py-4 text-center text-gray-500">No sizes available</p>
          )}
        </div>
      </div>

      <AddNewSizeForm onAddSize={onAddNewSize} updating={updating} />
    </div>
  );
};

export default SizesStockManager;
