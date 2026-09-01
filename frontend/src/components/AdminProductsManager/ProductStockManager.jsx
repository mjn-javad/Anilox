// components/Admin/ProductManagement/ProductStockManager.jsx

import React, { useState } from "react";

const StockItem = ({
  stock,
  quantity,
  onChangeStock,
  onDeleteStock,
  updating,
}) => {
  const [amount, setAmount] = useState(1);
  const availableQuantity = Number(quantity) || 0;

  const changeStock = async (value) => {
    const number = Number(amount);

    if (!Number.isInteger(number) || number < 1) {
      return alert("Please enter a valid quantity");
    }

    if (value < 0 && number > availableQuantity) {
      return alert(`Current quantity is ${availableQuantity}`);
    }

    const success = await onChangeStock(stock, number * value);

    if (success !== false) setAmount(1);
  };

  const deleteStock = async () => {
    if (!window.confirm(`Delete stock ${stock} completely?`)) return;
    await onDeleteStock(stock);
  };

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-4">
      <div className="flex justify-between">
        <strong>Stock {stock}</strong>
        <span>
          Quantity: <strong>{availableQuantity}</strong>
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
          disabled={updating || availableQuantity <= 0}
          onClick={() => changeStock(-1)}
          className="rounded-lg bg-orange-500 py-2 text-white disabled:bg-gray-400"
        >
          − Reduce
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={deleteStock}
          className="rounded-lg bg-red-500 py-2 text-white disabled:bg-gray-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const AddNewStockForm = ({ onAddStock, updating }) => {
  const [form, setForm] = useState({ stock: "", quantity: 1 });

  const submit = async (e) => {
    e.preventDefault();

    const stock = String(form.stock).trim();
    const quantity = Number(form.quantity);

    if (!stock || !Number.isInteger(quantity) || quantity < 1) {
      return alert("Enter valid stock and quantity");
    }

    const success = await onAddStock({ stock, quantity });

    if (success !== false) {
      setForm({ stock: "", quantity: 1 });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-t pt-4">
      <h3 className="text-lg font-semibold">Add New Stock</h3>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Stock"
          value={form.stock}
          disabled={updating}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
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
        Add New Stock
      </button>
    </form>
  );
};

const GroupStockForm = ({ onAddGroupStocks, updating, onClose }) => {
  const availableStocks = Array.from({ length: 14 }, (_, index) => index + 35);

  const [selected, setSelected] = useState([]);
  const [quantity, setQuantity] = useState(20);

  const toggleStock = (stock) => {
    setSelected((previous) =>
      previous.includes(stock)
        ? previous.filter((item) => item !== stock)
        : [...previous, stock],
    );
  };

  const handleSubmit = async () => {
    const amount = Number(quantity);

    if (!selected.length) {
      alert("Select at least one stock");
      return;
    }

    if (!Number.isInteger(amount) || amount < 1) {
      alert("Enter a valid quantity");
      return;
    }

    const success = await onAddGroupStocks(selected, amount);

    if (success) {
      setSelected([]);
      setQuantity(20);
      onClose();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
      <h3 className="font-semibold">Add Group Stocks</h3>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {availableStocks.map((stock) => (
          <button
            key={stock}
            type="button"
            disabled={updating}
            onClick={() => toggleStock(stock)}
            className={`rounded-lg border py-2 ${
              selected.includes(stock) ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {stock}
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
          {updating ? "Adding..." : `Add ${selected.length} Stocks`}
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

const ProductStockManager = ({
  type,
  stocks = [],
  onChangeStock,
  onDeleteStock,
  onAddNewStock,
  onAddGroupStocks,
  updating = false,
}) => {
  const [showGroupStocks, setShowGroupStocks] = useState(false);
  const normalizedStocks = Array.isArray(stocks) ? stocks : [];

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Product Stock Management</h2>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {normalizedStocks.map((item) => (
          <StockItem
            key={item.stock}
            stock={item.stock}
            quantity={item.quantity}
            onChangeStock={onChangeStock}
            onDeleteStock={onDeleteStock}
            updating={updating}
          />
        ))}

        {!normalizedStocks.length && (
          <p className="py-4 text-center text-gray-500">No stocks available</p>
        )}
      </div>

      {type === "shoe" && (
        <>
          <button
            type="button"
            onClick={() => setShowGroupStocks((previous) => !previous)}
            className="w-full rounded-lg bg-purple-500 py-2 text-white"
          >
            Group Stock
          </button>

          {showGroupStocks && (
            <GroupStockForm
              onAddGroupStocks={onAddGroupStocks}
              updating={updating}
              onClose={() => setShowGroupStocks(false)}
            />
          )}
        </>
      )}

      <AddNewStockForm onAddStock={onAddNewStock} updating={updating} />
    </div>
  );
};

export default ProductStockManager;
