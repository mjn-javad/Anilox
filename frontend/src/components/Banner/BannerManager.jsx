import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";
import MessageAlert from "../Shared/MessageAlert";

const BannerManager = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getImageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `/api/images/banners/${image}`;
  };

  const getBanners = () => {
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
          setError("an error acuured while fetching banners");
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
  };

  useEffect(() => {
    const cleanup = getBanners();

    return cleanup;
  }, []);

  const handleDeleteBanner = async (e, bannerId) => {
    e.stopPropagation();

    if (!bannerId) {
      setError("can not find this banner id");
      return;
    }

    const confirmDelete = window.confirm("Really want to delete this banner?");

    if (!confirmDelete) return;

    try {
      setDeletingId(bannerId);
      setError("");
      setMessage("");

      await apiClientBanner.delete(`/${bannerId}`);

      setBanners((prevBanners) =>
        prevBanners.filter((banner) => {
          const id = banner.id || banner.banner_id;
          return id !== bannerId;
        }),
      );

      setMessage("Banner deleted successfully");
    } catch (err) {
      console.log("Delete banner error:", err);
      setError("Error deleteing banner");
    } finally {
      setDeletingId(null);
    }
  };

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
          onClick={() => navigate("/admin/dashboard/banner-uploade")}
          className="px-5 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
        >
          Create Banner
        </button>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {message && <MessageAlert message={message} type="success" />}

      {!error && banners.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          No banner ProductFinderBox
        </div>
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

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/dashboard/editBanner/${bannerId}`, {
                        state: { banner },
                      });
                    }}
                    className="w-full py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-700 transition"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === bannerId}
                    onClick={(e) => handleDeleteBanner(e, bannerId)}
                    className={`
                      w-full py-2 rounded-xl text-white text-sm transition
                      ${
                        deletingId === bannerId
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    `}
                  >
                    {deletingId === bannerId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerManager;
