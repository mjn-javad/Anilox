// AdminSingleShoeManagement.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClientShoes from "../../services/api-client_shoes";
import apiClientBrandPopular from "../../services/api-client";

import LoadingSpinner from "../Shared/LoadingSpinner";
import MessageAlert from "../Shared/MessageAlert";
import ShoeInfoForm from "./ShoeInfoForm";
import SizesStockManager from "./SizesStockManager";
import ImagesManager from "./ImagesManager";

const AdminSingleShoeManagement = () => {
  const { shoeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [shoeInfo, setShoeInfo] = useState({
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

  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    fetchShoeData();
  }, [shoeId]);

  const fetchShoeData = async () => {
    try {
      setLoading(true);

      const response = await apiClientShoes.get(`/${shoeId}`);
      const shoe = response.data.data;

      setShoeInfo({
        name: shoe.name ?? "",
        slug: shoe.slug ?? "",
        brand: shoe.brand ?? "",
        model: shoe.model ?? "",
        category: shoe.category ?? "",
        gender: shoe.gender ?? "genderless",
        type: shoe.type ?? "shoe",
        price: shoe.price ?? "",
        discountPrice: shoe.discount_price ?? "",
        description: shoe.description ?? "",
        colors: shoe.colors ?? "",
      });

      let sizesArray = [];

      if (shoe.sizes && Array.isArray(shoe.sizes)) {
        sizesArray = shoe.sizes.map((item) => ({
          size: item.size,
          quantity: item.quantity,
        }));
      }

      setSizes(sizesArray);
      setImages(shoe.images || []);
      setNewImages([]);
      setDeletedImages([]);
      setError("");
    } catch (err) {
      console.error("Error fetching product data:", err);
      showError("Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;

    setShoeInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToNewArrivals = async () => {
    try {
      setUpdating(true);

      await apiClientBrandPopular.post(`/newArrivels/${shoeId}`);

      showSuccess(`"${shoeInfo.name}" added to new arrivals`);
    } catch (err) {
      console.error("Error adding to new arrivals:", err);
      showError(err.response?.data?.message || "Error adding to new arrivals");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!shoeInfo.name.trim()) {
      showError("Product name is required");
      return;
    }

    if (!shoeInfo.slug.trim()) {
      showError("Product slug is required");
      return;
    }

    if (!shoeInfo.brand.trim()) {
      showError("Product brand is required");
      return;
    }

    if (!shoeInfo.model.trim()) {
      showError("Product model is required");
      return;
    }

    if (!shoeInfo.price || Number(shoeInfo.price) <= 0) {
      showError("Please enter a valid price");
      return;
    }

    if (
      shoeInfo.discountPrice !== "" &&
      shoeInfo.discountPrice !== null &&
      Number(shoeInfo.discountPrice) < 0
    ) {
      showError("Discount price cannot be negative");
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        name: shoeInfo.name.trim(),
        slug: shoeInfo.slug.trim(),
        brand: shoeInfo.brand.trim(),
        model: shoeInfo.model.trim(),
        category: shoeInfo.category,
        gender: shoeInfo.gender,
        type: shoeInfo.type,
        price: Number(shoeInfo.price),
        discountPrice:
          shoeInfo.discountPrice === "" ||
          shoeInfo.discountPrice === null ||
          shoeInfo.discountPrice === undefined
            ? Number(shoeInfo.price)
            : Number(shoeInfo.discountPrice),
        description: shoeInfo.description?.trim() || null,
        colors: shoeInfo.colors?.trim() || null,
      };

      await apiClientShoes.put(`/${shoeId}/info`, payload);

      showSuccess("Product information updated successfully");
    } catch (err) {
      console.error("Error updating product info:", err);
      showError(err.response?.data?.message || "Failed to update product info");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddStock = async (size, currentQuantity) => {
    const addedStock = prompt(
      `Current stock for size ${size}: ${currentQuantity}\nEnter the stock amount you want to add:`,
      1,
    );

    if (!addedStock || isNaN(addedStock) || parseInt(addedStock) <= 0) {
      showError("Please enter a valid quantity");
      return;
    }

    try {
      setUpdating(true);

      await apiClientShoes.patch(`/${shoeId}/stock/${size}`, {
        size,
        quantity: parseInt(addedStock),
      });

      const updatedQuantity = parseInt(currentQuantity) + parseInt(addedStock);

      setSizes((prev) =>
        prev.map((item) =>
          item.size === size
            ? {
                ...item,
                quantity: updatedQuantity,
              }
            : item,
        ),
      );

      showSuccess(`Stock for size ${size} updated to ${updatedQuantity}`);
    } catch (err) {
      console.error("Error updating stock:", err);
      showError(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNewSize = async (newSizeData) => {
    if (!newSizeData.size) {
      showError("Please enter a size");
      return;
    }

    if (
      newSizeData.quantity === "" ||
      newSizeData.quantity === null ||
      isNaN(newSizeData.quantity) ||
      parseInt(newSizeData.quantity) < 0
    ) {
      showError("Please enter a valid quantity");
      return;
    }

    const exists = sizes.some(
      (item) => String(item.size) === String(newSizeData.size),
    );

    if (exists) {
      showError(`Size ${newSizeData.size} already exists`);
      return;
    }

    try {
      setUpdating(true);

      await apiClientShoes.patch(`/${shoeId}/stock/${newSizeData.size}`, {
        size: newSizeData.size,
        quantity: parseInt(newSizeData.quantity),
      });

      setSizes((prev) => [
        ...prev,
        {
          size: newSizeData.size,
          quantity: parseInt(newSizeData.quantity),
        },
      ]);

      showSuccess(`New size ${newSizeData.size} added successfully`);
    } catch (err) {
      console.error("Error adding new size:", err);
      showError(err.response?.data?.message || "Failed to add new size");
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

    if (
      newSortOrder === "" ||
      newSortOrder === null ||
      isNaN(newSortOrder) ||
      parseInt(newSortOrder) < 0
    ) {
      showError("Please enter a valid sort order");
      return;
    }

    try {
      setUpdating(true);

      await apiClientShoes.put(`/${shoeId}/images/sort-order`, {
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

      await apiClientShoes.put(`/${shoeId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchShoeData();

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>

        <button
          type="button"
          onClick={handleAddToNewArrivals}
          disabled={updating}
          className="
            bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300
            text-white px-5 py-2.5 rounded-lg transition-colors
            font-medium shadow-sm
          "
        >
          {updating ? "Adding..." : "Add to Big Size Shoes"}
        </button>
      </div>

      <MessageAlert message={error} type="error" />
      <MessageAlert message={successMessage} type="success" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ShoeInfoForm
          shoeInfo={shoeInfo}
          onChange={handleInfoChange}
          onUpdate={handleUpdateInfo}
          updating={updating}
        />

        <SizesStockManager
          sizes={sizes}
          onAddStock={handleAddStock}
          onAddNewSize={handleAddNewSize}
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

export default AdminSingleShoeManagement;
