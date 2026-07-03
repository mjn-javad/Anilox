import axios from "axios";
import apiClientBrand from "../../services/api-client_brand";
import React, { FormEvent, useState } from "react";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";
import Button from "../Shared/Button";

const BrandUploader = () => {
  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const [files, setFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null); // فقط برای پیش‌نمایش
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

    try {
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);

      if (files.length > 0) {
        formData.append("image", files[0]);
      }

      const res = await apiClientBrand.post("/", formData);
      setMessage(res.data.message || "Brand created successfully!");

      // reset form
      setForm({ name: "", slug: "" });
      setFiles([]);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // پاک کردن حافظه
        setImagePreview(null);
      }

      // reset input file
      const fileInput = document.getElementById("brand-image");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err.response?.data?.message || "Error creating shoe");
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <InputField
          name="name"
          label="Name"
          value={form.name}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
        />

        <InputField
          name="slug"
          label="Slug"
          value={form.slug}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
        />

        <div>
          <input
            id="brand-image"
            type="file"
            onChange={handleFileChange}
            className="text-center lg:px-5 lg:py-2 md:px-1 md:py-1 rounded-2xl bg-gray-500 hover:bg-gray-400 duration-200"
          />
        </div>

        {/* پیش‌نمایش تصویر */}
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md"
            />
          </div>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Brand
        </button>
        {message && <MessageAlert message={error} type="success" />}
        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default BrandUploader;
