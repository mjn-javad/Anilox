// components/Admin/ShoeManagement/ImagesManager.jsx
import React, { useState } from "react";

const ImageGallery = ({
  images,
  onDeleteImage,
  onUpdateSortOrder,
  onSaveSortOrder, // تابع جدید برای ذخیره در سرور
}) => {
  const imageBaseUrl = "http://localhost:4000/images/posts/";
  const [editingId, setEditingId] = useState(null);
  const [tempSortOrder, setTempSortOrder] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = (image, currentOrder) => {
    setEditingId(image.id || image.image_name);
    setTempSortOrder(currentOrder?.toString() || "0");
  };

  const saveSortOrder = async (image) => {
    const numValue = parseInt(tempSortOrder);
    if (!isNaN(numValue) && numValue >= 0) {
      // ابتدا state محلی را به‌روز کن
      onUpdateSortOrder(image, numValue);

      // سپس به سرور ارسال کن
      setSaving(true);
      try {
        await onSaveSortOrder(image.image_name, numValue);
        setEditingId(null);
      } catch (error) {
        console.error("Error saving sort order:", error);
        // در صورت خطا، state را برگردان
        onUpdateSortOrder(image, image.sort_order);
        alert("Failed to save sort order. Please try again.");
      } finally {
        setSaving(false);
      }
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempSortOrder("");
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Current Images
      </h3>
      {saving && (
        <div className="mb-2 text-sm text-blue-600">Saving sort order...</div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div key={idx} className="relative group">
            <img
              src={`${imageBaseUrl}${image.image_name || image}`}
              alt={`Shoe ${idx + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />

            {/* Sort Order Display/Editor */}
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 rounded-lg p-2">
              {editingId === (image.id || image.image_name) ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={tempSortOrder}
                    onChange={(e) => setTempSortOrder(e.target.value)}
                    className="w-16 px-1 py-0.5 text-sm bg-white text-gray-800 rounded"
                    autoFocus
                    disabled={saving}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveSortOrder(image);
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                  <button
                    onClick={() => saveSortOrder(image)}
                    disabled={saving}
                    className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600 disabled:bg-gray-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between text-white text-sm cursor-pointer hover:bg-white hover:bg-opacity-10 rounded px-1 py-0.5"
                  onClick={() => startEditing(image, image.sort_order)}
                >
                  <span>Order: {image.sort_order ?? 0}</span>
                  <span className="text-xs opacity-70">✎</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onDeleteImage(image)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Delete image"
            >
              🗑️
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-4">
            No images available
          </p>
        )}
      </div>
    </div>
  );
};

const ImagesManager = ({
  images,
  newImages,
  deletedImages,
  onImageUpload,
  onDeleteImage,
  onRemoveNewImage,
  onUpdateImages,
  onUpdateSortOrder,
  onSaveSortOrder, // تابع جدید
  updating,
}) => {
  const hasChanges = newImages.length > 0 || deletedImages.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Images Management
      </h2>

      <ImageGallery
        images={images}
        onDeleteImage={onDeleteImage}
        onUpdateSortOrder={onUpdateSortOrder}
        onSaveSortOrder={onSaveSortOrder}
      />

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Add New Images
        </h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageUpload}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />

        <button
          onClick={onUpdateImages}
          disabled={updating || !hasChanges}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
        >
          {updating ? "Updating..." : "Update Images"}
        </button>
      </div>
    </div>
  );
};

export default ImagesManager;
