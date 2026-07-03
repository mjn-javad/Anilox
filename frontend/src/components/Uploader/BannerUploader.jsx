import React, { FormEvent, useState } from "react";
import axios from "axios";
import apiClientBanner from "../../services/api-client_banner";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const BannerUploader = () => {
  const [form, setForm] = useState({
    title1: "",
    title2: "",
    sort_order: 0,
  });

  const [files, setFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (nameKey, value) => {
    setForm({
      ...form,
      [nameKey]: value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFiles([selectedFile]);
      // ساخت پیش‌نمایش
      const preview = URL.createObjectURL(selectedFile);
      setImagePreview(preview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی سمت کلاینت
    if (!form.title1 || !form.title2) {
      setError("Title1 and Title2 are required");
      return;
    }

    if (files.length === 0) {
      setError("Please select an image for the banner");
      return;
    }

    try {
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("title1", form.title1);
      formData.append("title2", form.title2);
      formData.append("sort_order", form.sort_order);

      if (files.length > 0) {
        formData.append("image", files[0]);
      }

      const res = await apiClientBanner.post("/", formData);
      setMessage(res.data.message || "Banner created successfully!");

      // reset form
      setForm({ title1: "", title2: "", sort_order: 0 });
      setFiles([]);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // پاک کردن حافظه
        setImagePreview(null);
      }

      // reset input file
      const fileInput = document.getElementById("banner-image");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Error response:", err.response?.data);
      console.error("Status:", err.response?.status);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred while creating the banner");
      }
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <InputField
          name="title1"
          label="Title 1"
          value={form.title1}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
          placeholder="Enter first title"
        />

        <InputField
          name="title2"
          label="Title 2"
          value={form.title2}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
          placeholder="Enter second title"
        />

        <InputField
          name="sort_order"
          label="Sort Order (optional)"
          type="number"
          value={form.sort_order}
          onChange={(event) =>
            handleChange(event.target.name, parseInt(event.target.value) || 0)
          }
          placeholder="0 = highest priority"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Banner Image *
          </label>
          <input
            id="banner-image"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="text-center lg:px-5 lg:py-2 md:px-1 md:py-1 rounded-2xl bg-gray-500 hover:bg-gray-400 duration-200"
          />
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF (Max 5MB)
          </p>
        </div>

        {/* پیش‌نمایش تصویر */}
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Banner Preview"
              className="w-full max-w-md h-40 object-cover rounded-lg mx-auto shadow-md"
            />
            <p className="text-sm text-gray-600 mt-1">Banner Preview</p>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-400 mx-10 transition duration-200"
        >
          Create Banner
        </button>

        {message && <MessageAlert message={message} type="success" />}
        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default BannerUploader;
