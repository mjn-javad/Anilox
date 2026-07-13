import React, { useEffect, useState } from "react";
import apiClientBanner from "../../services/api-client_banner";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const initialForm = {
  title1: "",
  title2: "",
  btnTitle1: "",
  btnLink1: "",
  btnTitle2: "",
  btnLink2: "",
  bannerLink: "",
  sort_order: 1,
};

const BannerUploader = () => {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    const maximumFileSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = ["bannerLink"];

    const hasEmptyField = requiredFields.some(
      (fieldName) => !String(form[fieldName]).trim(),
    );

    if (hasEmptyField) {
      setError("Please fill in all required fields");
      return;
    }

    if (!file) {
      setError("Please select an image for the banner");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append("title1", form.title1.trim());
      formData.append("title2", form.title2.trim());

      formData.append("btnTitle1", form.btnTitle1.trim());
      formData.append("btnLink1", form.btnLink1.trim());

      formData.append("btnTitle2", form.btnTitle2.trim());
      formData.append("btnLink2", form.btnLink2.trim());

      formData.append("bannerLink", form.bannerLink.trim());
      formData.append("sort_order", String(form.sort_order));
      formData.append("image", file);

      const response = await apiClientBanner.post("/", formData);

      setMessage(response.data?.message || "Banner created successfully!");

      setForm(initialForm);
      setFile(null);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      const fileInput = document.getElementById("banner-image");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Create banner error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Status:", err.response?.status);

      setError(
        err.response?.data?.message ||
          "An error occurred while creating the banner",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto my-8 px-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-xl flex-col gap-y-5 rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create Banner
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter banner information and select an image
          </p>
        </div>

        <InputField
          name="title1"
          label="Title 1"
          value={form.title1}
          onChange={handleChange}
          // required={true}
          placeholder="Enter first title"
        />

        <InputField
          name="title2"
          label="Title 2"
          value={form.title2}
          onChange={handleChange}
          // required={true}
          placeholder="Enter second title"
        />

        <div className="border-t border-gray-200 pt-5">
          <h2 className="mb-4 text-lg font-medium text-gray-800">
            First Button
          </h2>

          <div className="flex flex-col gap-y-4">
            <InputField
              name="btnTitle1"
              label="Button 1 Title"
              value={form.btnTitle1}
              onChange={handleChange}
              // required={true}
              placeholder="Example: Shop Now"
            />

            <InputField
              name="btnLink1"
              label="Button 1 Link"
              value={form.btnLink1}
              onChange={handleChange}
              // required={true}
              placeholder="Example: /slider-shoes?gender=female"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-5">
          <h2 className="mb-4 text-lg font-medium text-gray-800">
            Second Button
          </h2>

          <div className="flex flex-col gap-y-4">
            <InputField
              name="btnTitle2"
              label="Button 2 Title"
              value={form.btnTitle2}
              onChange={handleChange}
              // required={true}
              placeholder="Example: View Collection"
            />

            <InputField
              name="btnLink2"
              label="Button 2 Link"
              value={form.btnLink2}
              onChange={handleChange}
              // required={true}
              placeholder="Example: /new-arrivals"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-5">
          <InputField
            name="bannerLink"
            label="Banner Link"
            value={form.bannerLink}
            onChange={handleChange}
            // required={true}
            placeholder="Link opened when the banner is clicked"
          />
        </div>

        <InputField
          name="sort_order"
          label="Sort Order"
          type="number"
          value={form.sort_order}
          onChange={handleChange}
          placeholder="0 = highest priority"
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="banner-image"
            className="text-sm font-medium text-gray-700"
          >
            Banner Image *
          </label>

          <input
            id="banner-image"
            name="image"
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 transition hover:bg-gray-100"
          />

          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, WEBP and GIF — Maximum size: 5MB
          </p>
        </div>

        {imagePreview && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
            <img
              src={imagePreview}
              alt="Banner Preview"
              className="h-52 w-full rounded-lg object-cover"
            />

            <p className="mt-2 text-center text-sm text-gray-600">
              Banner Preview
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Creating Banner..." : "Create Banner"}
        </button>

        {message && <MessageAlert message={message} type="success" />}

        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default BannerUploader;
