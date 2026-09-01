// AdminSingleProductManagement.jsx

import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClientProducts from "../../services/api-client_products";
import apiClientBrandPopular from "../../services/api-client";

import LoadingSpinner from "../Shared/LoadingSpinner";
import MessageAlert from "../Shared/MessageAlert";
import ProductInfoForm from "./ProductInfoForm";
import ProductStockManager from "./ProductStockManager";
import ImagesManager from "./ImagesManager";

const AdminSingleProductManagement = () => {
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [productInfo, setProductInfo] = useState({
    name: "",
    slug: "",
    brand: "",
    model: "",
    category: "",
    gender: "",
    type: "",
    price: "",
    discountPrice: "",
    description: "",
    colors: "",
  });

  const [stocks, setStocks] = useState([]);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  }, []);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClientProducts.get(`/${productId}`);
      const product = response.data.data;

      setProductInfo({
        name: product.name ?? "",
        slug: product.slug ?? "",
        brand: product.brand ?? "",
        model: product.model ?? "",
        category: product.category ?? "",
        gender: product.gender ?? "genderless",
        type: product.type ?? "shoe",
        price: product.price ?? "",
        discountPrice: product.discount_price ?? "",
        description: product.description ?? "",
        colors: product.colors ?? "",
      });

      let stocksArray = [];

      if (product.stocks && Array.isArray(product.stocks)) {
        stocksArray = product.stocks.map((item) => ({
          stock: item.stock,
          quantity: item.quantity,
        }));
      }

      setStocks(stocksArray);
      setImages(product.images || []);
      setNewImages([]);
      setDeletedImages([]);
      setError("");
    } catch (err) {
      console.error("Error fetching product data:", err);
      showError("Failed to load product data");
    } finally {
      setLoading(false);
    }
  }, [productId, showError]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;

    setProductInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToBigSize = async () => {
    try {
      setUpdating(true);

      await apiClientBrandPopular.post(`/newArrivels/${productId}`);

      showSuccess(`"${productInfo.name}" added to big size`);
    } catch (err) {
      console.error("Error adding to big size:", err);
      showError(err.response?.data?.message || "Error adding to big size");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromBigSize = async () => {
    try {
      setUpdating(true);

      await apiClientBrandPopular.delete(`/newArrivels/${productId}`);

      showSuccess(`"${productInfo.name}" removed from big size`);
    } catch (err) {
      console.error("Error removing from big size:", err);
      showError(err.response?.data?.message || "Error removing from big size");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToBestSellers = async () => {
    try {
      setUpdating(true);

      await apiClientBrandPopular.post(`/bestSellers/${productId}`);

      showSuccess(`"${productInfo.name}" added to best sellers`);
    } catch (err) {
      console.error("Error adding to best sellers:", err);
      showError(err.response?.data?.message || "Error adding to best sellers");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromBestSellers = async () => {
    try {
      setUpdating(true);

      await apiClientBrandPopular.delete(`/bestSellers/${productId}`);

      showSuccess(`"${productInfo.name}" removed from best sellers`);
    } catch (err) {
      console.error("Error removing from best sellers:", err);
      showError(
        err.response?.data?.message || "Error removing from best sellers",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Delete "${productInfo.name}"?`)) return;

    try {
      setUpdating(true);

      const { data } = await apiClientProducts.delete(`/${productId}`);

      showSuccess(data.message);

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!productInfo.name.trim()) {
      showError("Product name is required");
      return;
    }

    if (!productInfo.slug.trim()) {
      showError("Product slug is required");
      return;
    }

    if (!productInfo.brand.trim()) {
      showError("Product brand is required");
      return;
    }

    if (!productInfo.model.trim()) {
      showError("Product model is required");
      return;
    }

    if (!productInfo.price || Number(productInfo.price) <= 0) {
      showError("Please enter a valid price");
      return;
    }

    if (
      productInfo.discountPrice !== "" &&
      productInfo.discountPrice !== null &&
      Number(productInfo.discountPrice) < 0
    ) {
      showError("Discount price cannot be negative");
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        name: productInfo.name.trim(),
        slug: productInfo.slug.trim(),
        brand: productInfo.brand.trim(),
        model: productInfo.model.trim(),
        category: productInfo.category,
        gender: productInfo.gender,
        type: productInfo.type,
        price: Number(productInfo.price),
        discountPrice:
          productInfo.discountPrice === "" ||
          productInfo.discountPrice === null ||
          productInfo.discountPrice === undefined
            ? Number(productInfo.price)
            : Number(productInfo.discountPrice),
        description: productInfo.description?.trim() || null,
        colors: productInfo.colors?.trim() || null,
      };

      await apiClientProducts.put(`/${productId}/info`, payload);

      showSuccess("Product information updated successfully");
    } catch (err) {
      console.error("Error updating product info:", err);
      showError(err.response?.data?.message || "Failed to update product info");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeStock = async (stock, quantityChange) => {
    const change = Number(quantityChange);

    if (!Number.isInteger(change) || change === 0) {
      showError("Please enter a valid quantity");
      return false;
    }

    const selectedStock = stocks.find(
      (item) => String(item.stock) === String(stock),
    );

    if (!selectedStock) {
      showError(`Stock ${stock} not found`);
      return false;
    }

    const currentQuantity = Number(selectedStock.quantity) || 0;
    const updatedQuantity = currentQuantity + change;

    if (updatedQuantity < 0) {
      showError("Stock cannot be less than zero");
      return false;
    }

    try {
      setUpdating(true);

      await apiClientProducts.patch(`/${productId}/stock/${stock}`, {
        stock,
        quantity: change,
      });

      setStocks((previousStocks) =>
        previousStocks.map((item) =>
          String(item.stock) === String(stock)
            ? {
                ...item,
                quantity: updatedQuantity,
              }
            : item,
        ),
      );

      showSuccess(`Stock for stock ${stock} updated to ${updatedQuantity}`);

      return true;
    } catch (error) {
      console.error("Error updating stock:", error);

      showError(error.response?.data?.message || "Failed to update stock");

      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStock = async (stock) => {
    const selectedStock = stocks.find(
      (item) => String(item.stock) === String(stock),
    );

    if (!selectedStock) {
      showError(`Stock ${stock} not found`);
      return false;
    }

    const currentQuantity = Number(selectedStock.quantity) || 0;

    try {
      setUpdating(true);

      /*
      تمام موجودی فعلی منفی می‌شود.
      مثلاً اگر موجودی 5 باشد، quantity برابر -5 ارسال می‌شود.
    */
      if (currentQuantity > 0) {
        await apiClientProducts.patch(`/${productId}/stock/${stock}`, {
          stock,
          quantity: -currentQuantity,
        });
      }

      setStocks((previousStocks) =>
        previousStocks.filter((item) => String(item.stock) !== String(stock)),
      );

      showSuccess(`Stock ${stock} deleted successfully`);

      return true;
    } catch (error) {
      console.error("Error deleting stock:", error);

      showError(error.response?.data?.message || "Failed to delete stock");

      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNewStock = async (newStockData) => {
    const stock = String(newStockData.stock || "").trim();
    const quantity = Number(newStockData.quantity);

    if (!stock) {
      showError("Please enter a stock");
      return false;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      showError("Quantity must be at least 1");
      return false;
    }

    const exists = stocks.some((item) => String(item.stock) === stock);

    if (exists) {
      showError(`Stock ${stock} already exists`);
      return false;
    }

    try {
      setUpdating(true);

      await apiClientProducts.patch(`/${productId}/stock/${stock}`, {
        stock,
        quantity,
      });

      setStocks((previousStocks) => [
        ...previousStocks,
        {
          stock,
          quantity,
        },
      ]);

      showSuccess(`New stock ${stock} added successfully`);

      return true;
    } catch (error) {
      console.error("Error adding new stock:", error);

      showError(error.response?.data?.message || "Failed to add new stock");

      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleGroupStocks = async (selectedStocks, quantity) => {
    const amount = Number(quantity);

    if (!selectedStocks.length || !Number.isInteger(amount) || amount < 1) {
      showError("Select stocks and enter a valid quantity");
      return false;
    }

    try {
      setUpdating(true);

      for (const item of selectedStocks) {
        const stock = String(item);

        await apiClientProducts.patch(`/${productId}/stock/${stock}`, {
          stock,
          quantity: amount,
        });
      }

      setStocks((previous) => {
        const updated = [...previous];

        selectedStocks.forEach((item) => {
          const stock = String(item);

          const index = updated.findIndex((row) => String(row.stock) === stock);

          if (index >= 0) {
            updated[index] = {
              ...updated[index],
              quantity: Number(updated[index].quantity) + amount,
            };
          } else {
            updated.push({
              stock,
              quantity: amount,
            });
          }
        });

        return updated;
      });

      showSuccess(`${selectedStocks.length} stocks added successfully`);
      return true;
    } catch (error) {
      console.error("Error adding group stocks:", error);

      showError(error.response?.data?.message || "Failed to add group stocks");

      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  const handleDeleteImage = (image) => {
    setDeletedImages((prev) => [...prev, image]);

    setImages((prev) =>
      prev.filter((img) => {
        const currentImageKey = img.id || img.image_name || img;
        const deletedImageKey = image.id || image.image_name || image;

        return currentImageKey !== deletedImageKey;
      }),
    );
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSortOrder = (image, newSortOrder) => {
    setImages((prevImages) =>
      prevImages.map((img) => {
        const currentImageKey = img.id || img.image_name;
        const targetImageKey = image.id || image.image_name;

        if (currentImageKey === targetImageKey) {
          return {
            ...img,
            sort_order: newSortOrder,
          };
        }

        return img;
      }),
    );
  };

  const handleSaveSortOrder = async (imageName, newSortOrder) => {
    if (!imageName) {
      showError("Image name is required");
      return;
    }

    if (newSortOrder === "" || newSortOrder === null || isNaN(newSortOrder)) {
      showError("Please enter a valid sort order");
      return;
    }

    try {
      setUpdating(true);

      await apiClientProducts.put(`/${productId}/images/sort-order`, {
        imageName,
        sortOrder: parseInt(newSortOrder),
      });

      showSuccess(`Sort order updated successfully for image ${imageName}`);
    } catch (err) {
      console.error("Error saving sort order:", err);
      showError(err.response?.data?.message || "Failed to update sort order");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateImages = async () => {
    if (newImages.length === 0 && deletedImages.length === 0) {
      showError("No changes to images");
      return;
    }

    const formData = new FormData();

    newImages.forEach((image) => {
      formData.append("images", image);
    });

    formData.append("deletedImages", JSON.stringify(deletedImages));

    try {
      setUpdating(true);

      await apiClientProducts.put(`/${productId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchProductData();

      setNewImages([]);
      setDeletedImages([]);

      showSuccess("Images updated successfully");
    } catch (err) {
      console.error("Error updating images:", err);
      showError(err.response?.data?.message || "Failed to update images");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border rounded-lg p-3">
            <p className="font-semibold mb-2">Big Size</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToBigSize}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-lg"
              >
                {updating ? "..." : "Add"}
              </button>

              <button
                type="button"
                onClick={handleRemoveFromBigSize}
                disabled={updating}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white py-2 rounded-lg"
              >
                {updating ? "..." : "Remove"}
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <p className="font-semibold mb-2">Best Seller</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToBestSellers}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-lg"
              >
                {updating ? "..." : "Add"}
              </button>

              <button
                type="button"
                onClick={handleRemoveFromBestSellers}
                disabled={updating}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white py-2 rounded-lg"
              >
                {updating ? "..." : "Remove"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDeleteProduct}
            disabled={updating}
            className="sm:col-span-2 bg-red-700 hover:bg-red-800 disabled:bg-red-300 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            {updating ? "Please wait..." : "Delete Product"}
          </button>
        </div>
      </div>

      <MessageAlert message={error} type="error" />
      <MessageAlert message={successMessage} type="success" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductInfoForm
          productInfo={productInfo}
          onChange={handleInfoChange}
          onUpdate={handleUpdateInfo}
          updating={updating}
        />

        <ProductStockManager
          type={productInfo.type}
          stocks={stocks}
          onChangeStock={handleChangeStock}
          onDeleteStock={handleDeleteStock}
          onAddNewStock={handleAddNewStock}
          onAddGroupStocks={handleGroupStocks}
          updating={updating}
        />

        <ImagesManager
          images={images}
          newImages={newImages}
          deletedImages={deletedImages}
          onImageUpload={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          onRemoveNewImage={handleRemoveNewImage}
          onUpdateImages={handleUpdateImages}
          onUpdateSortOrder={handleUpdateSortOrder}
          onSaveSortOrder={handleSaveSortOrder}
          updating={updating}
        />
      </div>
    </div>
  );
};

export default AdminSingleProductManagement;
