import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";

const EditBanner = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bannerFromState = location.state?.banner;

  const [form, setForm] = useState({
    title1: "",
    title2: "",
    sort_order: 0,
  });

  const [oldImage, setOldImage] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `/api/images/banners/${image}`;
  };

  const fillForm = (banner) => {
    setForm({
      title1: banner.title1 || "",
      title2: banner.title2 || "",
      sort_order: banner.sort_order || 0,
    });

    setOldImage(banner.image || "");
  };

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    if (bannerFromState) {
      fillForm(bannerFromState);
      setLoading(false);
      return;
    }

    // اگر کاربر مستقیم وارد صفحه ادیت شد یا رفرش کرد
    // اینجا همه بنرها را می‌گیریم و بنر موردنظر را پیدا می‌کنیم
    apiClientBanner
      .get("/")
      .then((res) => {
        const result = res.data?.data || res.data;
        const banners = Array.isArray(result) ? result : [];

        const selectedBanner = banners.find(
          (item) => String(item.id || item.banner_id) === String(id),
        );

        if (!selectedBanner) {
          throw new Error("Banner not found");
        }

        if (isMounted) {
          fillForm(selectedBanner);
        }
      })
      .catch((err) => {
        console.log("Get banner error:", err);

        if (isMounted) {
          setError("بنر مورد نظر پیدا نشد");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (nameKey, value) => {
    setForm((prev) => ({
      ...prev,
      [nameKey]: value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(selectedFile);
    setImagePreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title1 || !form.title2) {
      setError("Title 1 و Title 2 الزامی هستند");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append("title1", form.title1);
      formData.append("title2", form.title2);
      formData.append("sort_order", form.sort_order);

      if (file) {
        formData.append("image", file);
      }

      const res = await apiClientBanner.put(`/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data?.message || "بنر با موفقیت آپدیت شد");

      setTimeout(() => {
        navigate("/admin/dashboard/banners");
      }, 700);
    } catch (err) {
      console.log("Update banner error:", err.response?.data || err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("خطا در آپدیت بنر");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <div className="h-10 bg-gray-100 animate-pulse rounded-xl mb-5" />
          <div className="h-[300px] bg-gray-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !form.title1) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <MessageAlert message={error} type="error" />

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/banners")}
          className="mt-5 px-5 py-2 rounded-xl bg-black text-white"
        >
          Back To Banners
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto flex flex-col gap-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-light">Edit Banner</h1>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/banners")}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Back
          </button>
        </div>

        <InputField
          name="title1"
          label="Title 1"
          value={form.title1}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
          placeholder="Enter title"
        />

        <InputField
          name="title2"
          label="Title 2 / Link"
          value={form.title2}
          onChange={(event) =>
            handleChange(event.target.name, event.target.value)
          }
          required={true}
          placeholder="/slider-shoes?type=shoe&gender=female"
        />

        <InputField
          name="sort_order"
          label="Sort Order"
          type="number"
          value={form.sort_order}
          onChange={(event) =>
            handleChange(event.target.name, parseInt(event.target.value) || 0)
          }
          placeholder="Sort order"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Current Image
          </label>

          {oldImage && (
            <img
              src={getImageUrl(oldImage)}
              alt="Current Banner"
              className="w-full h-[240px] object-cover rounded-xl shadow-sm"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Change Image
          </label>

          <input
            id="banner-image"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="text-center lg:px-5 lg:py-2 md:px-1 md:py-1 rounded-2xl bg-gray-500 text-white hover:bg-gray-400 duration-200"
          />

          <p className="text-xs text-gray-500">
            اگر عکس جدید انتخاب نکنی، عکس قبلی باقی می‌ماند.
          </p>
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">New Image Preview</p>

            <img
              src={imagePreview}
              alt="New Banner Preview"
              className="w-full h-[240px] object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={updating}
          className={`py-3 rounded-xl text-white transition duration-200 ${
            updating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {updating ? "Updating..." : "Update Banner"}
        </button>

        {message && <MessageAlert message={message} type="success" />}
        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default EditBanner;
