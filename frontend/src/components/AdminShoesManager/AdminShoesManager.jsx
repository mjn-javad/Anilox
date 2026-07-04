// AdminShoesManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // اضافه کردن useNavigate
import apiClientShoes from "../../services/api-client_shoes";
import apiClientBrandPopular from "../../services/api-client_brand";
import MessageAlert from "../Shared/MessageAlert";
import LoadingSpinner from "../Shared/LoadingSpinner";

const AdminShoesManagement = () => {
  const navigate = useNavigate(); // برای هدایت به صفحه ویرایش
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [stockSize, setStockSize] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    fetchAllShoes();
  }, []);

  const fetchAllShoes = async () => {
    try {
      setLoading(true);
      const response = await apiClientShoes.get("/");
      setShoes(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load shoes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShoe = async (shoeId, shoeName) => {
    if (!window.confirm(`Are you sure you want to delete "${shoeName}"?`)) {
      return;
    }

    try {
      await apiClientShoes.delete(`/${shoeId}`);
      setActionMessage({
        type: "success",
        text: `Shoe "${shoeName}" successfully deleted`,
      });
      fetchAllShoes();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error deleting shoe",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAddToBestSellers = async (shoeId, shoeName) => {
    try {
      await apiClientBrandPopular.post(`/bestSellers/${shoeId}`);
      setActionMessage({
        type: "success",
        text: `Shoe "${shoeName}" added to best sellers list`,
      });
      fetchAllShoes();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error adding to best sellers",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleRemoveFromBestSellers = async (shoeId, shoeName) => {
    try {
      await apiClientBrandPopular.delete(`/bestSellers/${shoeId}`);
      setActionMessage({
        type: "success",
        text: `Shoe "${shoeName}" removed from best sellers list`,
      });
      fetchAllShoes();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error removing from best sellers",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleRemoveFromNewArrivels = async (shoeId, shoeName) => {
    try {
      await apiClientBrandPopular.delete(`/newArrivels/${shoeId}`);
      setActionMessage({
        type: "success",
        text: `Shoe "${shoeName}" removed from new arrivels list`,
      });
      fetchAllShoes();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error removing from new arrivels",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAddToNewArrivals = async (shoeId, shoeName) => {
    try {
      await apiClientBrandPopular.post(`/newArrivels/${shoeId}`);
      setActionMessage({
        type: "success",
        text: `Shoe "${shoeName}" added to new arrivals list`,
      });
      fetchAllShoes();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error adding to new arrivals",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleShoeClick = (shoeId) => {
    navigate(`/admin/dashboard/editShoe/${shoeId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <MessageAlert message={error} type="error" />;
  }

  return (
    <div className="container">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shoes Management</h1>
          <button
            onClick={fetchAllShoes}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Display messages */}
        {actionMessage.text && (
          <MessageAlert
            message={actionMessage.text}
            type={actionMessage.type}
          />
        )}

        {/* Shoes table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {shoes.map((shoe) => (
                <tr
                  key={shoe.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleShoeClick(shoe.id)}
                >
                  {/* Image */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-20 h-20">
                      <img
                        src={
                          shoe?.images?.[0]?.image_name
                            ? `/api/images/posts/${shoe?.images?.[0]?.image_name}`
                            : "/api/placeholder/50/50"
                        }
                        alt={shoe.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  </td>

                  {/* Shoe Name */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {shoe.name}
                    </div>
                    <div className="text-xs text-gray-500">{shoe.brand}</div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 line-through">
                      ${shoe.price?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-900">
                      ${shoe.discount_price?.toLocaleString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleAddToBestSellers(shoe.id, shoe.name);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Add to Best Seller
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleAddToNewArrivals(shoe.id, shoe.name);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          🆕 Add to New Arrival
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRemoveFromBestSellers(shoe.id, shoe.name);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Remove From Best Seller
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRemoveFromNewArrivels(shoe.id, shoe.name);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Remove From New Arrivle
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteShoe(shoe.id, shoe.name);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* If no shoes found */}
        {shoes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No shoes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShoesManagement;
