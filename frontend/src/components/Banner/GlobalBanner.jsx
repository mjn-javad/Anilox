import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const GlobalBanner = ({ brandId, link = "/" }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!brandId) {
      setError("آیدی برند ارسال نشده است");
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    setError("");

    apiClientBanner
      .get(`/${brandId}`)
      .then((res) => {
        const data = res.data?.data || res.data;

        if (isMounted) {
          setBanner(data);
        }
      })
      .catch((err) => {
        console.log(err);

        if (isMounted) {
          setError("خطا در دریافت اطلاعات بنر");
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
  }, [brandId]);

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="w-full h-[400px] sm:h-[500px] md:h-[660px] bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error || !banner) {
    return null;
  }

  const imageUrl = banner.image;

  const bannerContent = (
    <div className="min-w-full relative overflow-hidden group cursor-pointer">
      <img
        src={imageUrl}
        alt={banner.title2 || banner.title1 || "brand banner"}
        className="w-full h-[400px] sm:h-[500px] md:h-[660px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Very soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent"></div>

      {/* Text */}
      <div className="absolute left-6 sm:left-10 md:left-16 top-1/2 -translate-y-1/2">
        <p className="text-white text-xs sm:text-sm md:text-base font-light tracking-[0.35em] uppercase mb-3 drop-shadow-lg">
          {banner.title1}
        </p>

        <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.18em] uppercase drop-shadow-xl">
          {banner.title2}
        </h1>

        <div className="mt-5 w-14 sm:w-20 h-[1px] bg-white/90 drop-shadow-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto">
      <Link to={link}>{bannerContent}</Link>
    </div>
  );
};

export default GlobalBanner;
