// AdminProductsManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // اضافه کردن useNavigate
import apiClientProducts from "../../services/api-client_products";
import apiClientBrandPopular from "../../services/api-client_brand";
import MessageAlert from "../Shared/MessageAlert";
import LoadingSpinner from "../Shared/LoadingSpinner";

const AdminProductsManagement = () => {
  const navigate = useNavigate(); // برای هدایت به صفحه ویرایش
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClientProducts.get("/");
      setProducts(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await apiClientProducts.delete(`/${productId}`);
      setActionMessage({
        type: "success",
        text: `Product "${productName}" successfully deleted`,
      });
      fetchAllProducts();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error deleting product",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAddToBestSellers = async (productId, productName) => {
    try {
      await apiClientBrandPopular.post(`/bestSellers/${productId}`);
      setActionMessage({
        type: "success",
        text: `Product "${productName}" added to best sellers list`,
      });
      fetchAllProducts();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error adding to best sellers",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleRemoveFromBestSellers = async (productId, productName) => {
    try {
      await apiClientBrandPopular.delete(`/bestSellers/${productId}`);
      setActionMessage({
        type: "success",
        text: `Product "${productName}" removed from best sellers list`,
      });
      fetchAllProducts();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error removing from best sellers",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleRemoveFromNewArrivels = async (productId, productName) => {
    try {
      await apiClientBrandPopular.delete(`/newArrivels/${productId}`);
      setActionMessage({
        type: "success",
        text: `Product "${productName}" removed from new arrivels list`,
      });
      fetchAllProducts();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error removing from new arrivels",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAddToNewArrivals = async (productId, productName) => {
    try {
      await apiClientBrandPopular.post(`/newArrivels/${productId}`);
      setActionMessage({
        type: "success",
        text: `Product "${productName}" added to new arrivals list`,
      });
      fetchAllProducts();
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Error adding to new arrivals",
      });
      setTimeout(() => setActionMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/admin/dashboard/editProduct/${productId}`);
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
          <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
          <button
            onClick={fetchAllProducts}
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

        {/* Products table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Image */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-20 h-20">
                      <img
                        src={
                          product?.images?.[0]?.image_name
                            ? `/api/images/posts/${product?.images?.[0]?.image_name}`
                            : "/api/placeholder/50/50"
                        }
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  </td>

                  {/* Product Name */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">{product.brand}</div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 line-through">
                      ${product.price?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-900">
                      ${product.discount_price?.toLocaleString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleAddToBestSellers(product.id, product.name);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Add to Best Seller
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleAddToNewArrivals(product.id, product.name);
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
                            handleRemoveFromBestSellers(product.id, product.name);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Remove From Best Seller
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRemoveFromNewArrivels(product.id, product.name);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📈 Remove From New Arrivle
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteProduct(product.id, product.name);
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

        {/* If no products found */}
        {products.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsManagement;
