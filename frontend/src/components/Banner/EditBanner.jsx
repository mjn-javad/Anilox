import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  sort_order: 0,
};

const EditBanner = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bannerFromState = location.state?.banner;

  const [form, setForm] = useState(initialForm);

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
      btnTitle1: banner.btnTitle1 || "",
      btnLink1: banner.btnLink1 || "",
      btnTitle2: banner.btnTitle2 || "",
      btnLink2: banner.btnLink2 || "",
      bannerLink: banner.bannerLink || "",
      sort_order: Number(banner.sort_order) || 0,
    });

    setOldImage(banner.image || "");
  };

  useEffect(() => {
    let isMounted = true;

    const getBanner = async () => {
      setLoading(true);
      setError("");

      try {
        if (bannerFromState) {
          fillForm(bannerFromState);
          return;
        }

        const response = await apiClientBanner.get("/");
        const result = response.data?.data || response.data;
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
      } catch (err) {
        console.error("Get banner error:", err);

        if (isMounted) {
          setError("بنر موردنظر پیدا نشد");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getBanner();

    return () => {
      isMounted = false;
    };
  }, [id, bannerFromState]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
      setError("لطفاً یک فایل تصویری معتبر انتخاب کن");
      event.target.value = "";
      return;
    }

    const maximumFileSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      setError("حجم تصویر نباید بیشتر از 5 مگابایت باشد");
      event.target.value = "";
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
      (fieldName) => !String(form[fieldName] || "").trim(),
    );

    if (hasEmptyField) {
      setError("تمام فیلدهای عنوان و لینک الزامی هستند");
      return;
    }

    try {
      setUpdating(true);
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

      if (file) {
        formData.append("image", file);
      }

      const response = await apiClientBanner.put(`/${id}`, formData);

      setMessage(response.data?.message || "بنر با موفقیت آپدیت شد");

      setTimeout(() => {
        navigate("/admin/dashboard/banners");
      }, 700);
    } catch (err) {
      console.error("Update banner error:", err.response?.data || err);

      setError(err.response?.data?.message || "خطا در آپدیت بنر");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-5 h-10 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-[300px] animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error && !form.title1) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-10">
        <MessageAlert message={error} type="error" />

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/banners")}
          className="mt-5 rounded-xl bg-black px-5 py-2 text-white"
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
        className="mx-auto flex max-w-xl flex-col gap-y-5 rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-light md:text-3xl">Edit Banner</h1>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/banners")}
            className="text-sm text-gray-500 transition hover:text-black"
          >
            Back
          </button>
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
              placeholder="/slider-shoes?type=shoe&gender=female"
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
              placeholder="/new-arrivals?gender=female"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-5">
          <InputField
            name="bannerLink"
            label="Banner Link"
            value={form.bannerLink}
            onChange={handleChange}
            required={true}
            placeholder="/women"
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
          <label className="text-sm font-medium text-gray-700">
            Current Image
          </label>

          {oldImage ? (
            <img
              src={getImageUrl(oldImage)}
              alt="Current Banner"
              className="h-[240px] w-full rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[160px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
              No current image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="banner-image"
            className="text-sm font-medium text-gray-700"
          >
            Change Image
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
            اگر تصویر جدید انتخاب نکنی، تصویر قبلی باقی می‌ماند.
          </p>
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="mb-2 text-sm text-gray-600">New Image Preview</p>

            <img
              src={imagePreview}
              alt="New Banner Preview"
              className="h-[240px] w-full rounded-xl object-cover shadow-md"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={updating}
          className={`rounded-xl py-3 text-white transition duration-200 ${
            updating
              ? "cursor-not-allowed bg-gray-400"
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
