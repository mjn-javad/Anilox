import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";
import MessageAlert from "../Shared/MessageAlert";

const BannerManager = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `/api/images/banners/${image}`;
  };

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError("");

    apiClientBanner
      .get("/")
      .then((res) => {
        const result = res.data?.data || res.data;

        if (isMounted) {
          setBanners(Array.isArray(result) ? result : []);
        }
      })
      .catch((err) => {
        console.log("Get banners error:", err);

        if (isMounted) {
          setError("خطا در دریافت لیست بنرها");
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
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-light mb-8 text-center">
          Banner Management
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-[320px] bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-light">Banner Management</h1>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/banner-uploader")}
          className="px-5 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
        >
          Create Banner
        </button>
      </div>

      {error && <MessageAlert message={error} type="error" />}

      {!error && banners.length === 0 && (
        <div className="text-center text-gray-500 py-20">هیچ بنری پیدا نشد</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          const bannerId = banner.id || banner.banner_id;

          return (
            <div
              key={bannerId}
              onClick={() =>
                navigate(`/admin/dashboard/editBanner/${bannerId}`, {
                  state: { banner },
                })
              }
              className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-[260px] overflow-hidden bg-gray-50">
                <img
                  src={getImageUrl(banner.image)}
                  alt={banner.title1 || "Banner"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                  Sort: {banner.sort_order}
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-light text-gray-900">
                  {banner.title1 || "No Title"}
                </h2>

                <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                  Link: {banner.title2 || "/"}
                </p>

                <button
                  type="button"
                  className="mt-5 w-full py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-700 transition"
                >
                  Edit Banner
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerManager;
