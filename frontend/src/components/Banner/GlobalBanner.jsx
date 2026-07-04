import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const IMAGE_BASE_URL = "/api/images/banners/";

const GlobalBanner = ({ sort_order }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(false);

  const getImageUrl = (image) => `${IMAGE_BASE_URL}${image}`;

  useEffect(() => {
    if (!sort_order) {
      setError("sort_order ارسال نشده است");
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setShowText(false);

    apiClientBanner
      .get(`/${sort_order}`)
      .then((res) => {
        const result = res.data?.data || res.data;

        let finalBanners = [];

        if (Array.isArray(result)) {
          finalBanners = result;
        } else if (result) {
          finalBanners = [result];
        }

        if (!isMounted) return;

        setBanners(finalBanners);

        // preload کردن همه عکس‌ها برای اینکه اسلایدر خاکستری نشود
        finalBanners.forEach((banner) => {
          if (banner?.image) {
            const img = new Image();
            img.src = getImageUrl(banner.image);
          }
        });
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
  }, [sort_order]);

  // نمایش متن کمی بعد از آمدن عکس
  useEffect(() => {
    setShowText(false);

    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // اسلایدر اتوماتیک
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="w-full h-[220px] sm:h-[360px] md:h-[520px] lg:h-[660px] bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  const bannerContent = (
    <div className="min-w-full relative overflow-hidden group cursor-pointer bg-gray-100">
      <div className="w-full h-[220px] sm:h-[360px] md:h-[520px] lg:h-[660px] overflow-hidden">
        <img
          src={getImageUrl(currentBanner.image)}
          alt={currentBanner.title1 || "brand banner"}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            ease-out
            lg:group-hover:scale-105
          "
        />
      </div>

      {/* Very soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

      {/* Text */}
      <div
        className={`
          absolute left-6 sm:left-10 md:left-16 top-3/4 sm:top-1/2 -translate-y-1/2
          transition-all duration-700
          ${showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}
      >
        {currentBanner.title1 && (
          <h1 className="text-white text-2xl sm:text-5xl md:text-6xl font-light tracking-[0.18em] uppercase drop-shadow-xl">
            {currentBanner.title1}
          </h1>
        )}

        <div className="mt-5 w-14 sm:w-20 h-[1px] bg-white/90 drop-shadow-lg" />
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto">
      <Link to={currentBanner.title2 || "#"}>{bannerContent}</Link>
    </div>
  );
};

export default GlobalBanner;
