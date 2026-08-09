// components/Admin/ShoeManagement/SizesStockManager.jsx

import React, { useState } from "react";

const SizeItem = ({
  size,
  quantity,
  onChangeStock,
  onDeleteSize,
  updating,
}) => {
  const [amount, setAmount] = useState(1);
  const stock = Number(quantity) || 0;

  const changeStock = async (value) => {
    const number = Number(amount);

    if (!Number.isInteger(number) || number < 1) {
      return alert("Please enter a valid quantity");
    }

    if (value < 0 && number > stock) {
      return alert(`Current stock is ${stock}`);
    }

    const success = await onChangeStock(size, number * value);

    if (success !== false) setAmount(1);
  };

  const deleteSize = async () => {
    if (!window.confirm(`Delete size ${size} completely?`)) return;
    await onDeleteSize(size);
  };

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-4">
      <div className="flex justify-between">
        <strong>Size {size}</strong>
        <span>
          Stock: <strong>{stock}</strong>
        </span>
      </div>

      <input
        type="number"
        min="1"
        value={amount}
        disabled={updating}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={updating}
          onClick={() => changeStock(1)}
          className="rounded-lg bg-green-500 py-2 text-white disabled:bg-gray-400"
        >
          + Add
        </button>

        <button
          type="button"
          disabled={updating || stock <= 0}
          onClick={() => changeStock(-1)}
          className="rounded-lg bg-orange-500 py-2 text-white disabled:bg-gray-400"
        >
          − Reduce
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={deleteSize}
          className="rounded-lg bg-red-500 py-2 text-white disabled:bg-gray-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const AddNewSizeForm = ({ onAddSize, updating }) => {
  const [form, setForm] = useState({ size: "", quantity: 1 });

  const submit = async (e) => {
    e.preventDefault();

    const size = String(form.size).trim();
    const quantity = Number(form.quantity);

    if (!size || !Number.isInteger(quantity) || quantity < 1) {
      return alert("Enter valid size and quantity");
    }

    const success = await onAddSize({ size, quantity });

    if (success !== false) {
      setForm({ size: "", quantity: 1 });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-t pt-4">
      <h3 className="text-lg font-semibold">Add New Size</h3>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Size"
          value={form.size}
          disabled={updating}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="rounded-lg border px-3 py-2"
        />

        <input
          type="number"
          min="1"
          value={form.quantity}
          disabled={updating}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="rounded-lg border px-3 py-2"
        />
      </div>

      <button
        disabled={updating}
        className="w-full rounded-lg bg-blue-500 py-2 text-white disabled:bg-gray-400"
      >
        Add New Size
      </button>
    </form>
  );
};

const GroupSizeForm = ({ onAddGroupSizes, updating, onClose }) => {
  const availableSizes = Array.from({ length: 14 }, (_, index) => index + 35);

  const [selected, setSelected] = useState([]);
  const [quantity, setQuantity] = useState(20);

  const toggleSize = (size) => {
    setSelected((previous) =>
      previous.includes(size)
        ? previous.filter((item) => item !== size)
        : [...previous, size],
    );
  };

  const handleSubmit = async () => {
    const amount = Number(quantity);

    if (!selected.length) {
      alert("Select at least one size");
      return;
    }

    if (!Number.isInteger(amount) || amount < 1) {
      alert("Enter a valid quantity");
      return;
    }

    const success = await onAddGroupSizes(selected, amount);

    if (success) {
      setSelected([]);
      setQuantity(20);
      onClose();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
      <h3 className="font-semibold">Add Group Sizes</h3>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {availableSizes.map((size) => (
          <button
            key={size}
            type="button"
            disabled={updating}
            onClick={() => toggleSize(size)}
            className={`rounded-lg border py-2 ${
              selected.includes(size) ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <input
        type="number"
        min="1"
        value={quantity}
        disabled={updating}
        onChange={(event) => setQuantity(event.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={updating}
          onClick={handleSubmit}
          className="rounded-lg bg-green-500 py-2 text-white disabled:bg-gray-400"
        >
          {updating ? "Adding..." : `Add ${selected.length} Sizes`}
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={onClose}
          className="rounded-lg bg-gray-500 py-2 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const SizesStockManager = ({
  type,
  sizes = [],
  onChangeStock,
  onDeleteSize,
  onAddNewSize,
  onAddGroupSizes,
  updating = false,
}) => {
  const [showGroupSizes, setShowGroupSizes] = useState(false);
  const normalizedSizes = Array.isArray(sizes) ? sizes : [];

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Sizes & Stock Management</h2>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {normalizedSizes.map((item) => (
          <SizeItem
            key={item.size}
            size={item.size}
            quantity={item.quantity}
            onChangeStock={onChangeStock}
            onDeleteSize={onDeleteSize}
            updating={updating}
          />
        ))}

        {!normalizedSizes.length && (
          <p className="py-4 text-center text-gray-500">No sizes available</p>
        )}
      </div>

      {type === "shoe" && (
        <>
          <button
            type="button"
            onClick={() => setShowGroupSizes((previous) => !previous)}
            className="w-full rounded-lg bg-purple-500 py-2 text-white"
          >
            Group Size
          </button>

          {showGroupSizes && (
            <GroupSizeForm
              onAddGroupSizes={onAddGroupSizes}
              updating={updating}
              onClose={() => setShowGroupSizes(false)}
            />
          )}
        </>
      )}

      <AddNewSizeForm onAddSize={onAddNewSize} updating={updating} />
    </div>
  );
};

export default SizesStockManager;
