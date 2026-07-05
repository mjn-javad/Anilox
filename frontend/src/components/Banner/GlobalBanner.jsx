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

  // متن با تاخیر بعد از تغییر عکس ظاهر می‌شود
  useEffect(() => {
    setShowText(false);

    const timer = setTimeout(() => {
      setShowText(true);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // اسلایدر اتوماتیک
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="h-[220px] w-full animate-pulse bg-gray-100 sm:h-[360px] md:h-[520px] lg:h-[660px]" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  const bannerContent = (
    <div
      key={currentIndex}
      className="banner-reveal group relative min-w-full cursor-pointer overflow-hidden bg-gray-100"
    >
      <div className="h-[220px] w-full overflow-hidden sm:h-[360px] md:h-[520px] lg:h-[660px]">
        <img
          src={getImageUrl(currentBanner.image)}
          alt={currentBanner.title1 || "brand banner"}
          className="
            banner-image
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            lg:group-hover:scale-105
          "
        />
      </div>

      {/* گرادیانت خیلی نرم */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

      {/* افکت طلایی هنگام تغییر بنر */}
      <div className="banner-light absolute inset-0 pointer-events-none" />

      {/* Text */}
      <div
        className={`
          absolute left-6 top-3/4 -translate-y-1/2
          transition-all duration-700 ease-out
          sm:left-10 sm:top-1/2 md:left-16
          ${
            showText
              ? "translate-x-0 opacity-100 blur-0"
              : "-translate-x-5 opacity-0 blur-sm"
          }
        `}
      >
        {currentBanner.title1 && (
          <h1 className="text-2xl font-light uppercase tracking-[0.18em] text-white drop-shadow-xl sm:text-5xl md:text-6xl">
            {currentBanner.title1}
          </h1>
        )}

        <div className="mt-5 h-[1px] w-14 bg-white/90 drop-shadow-lg sm:w-20" />
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
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

      <style>{`
        .banner-reveal {
          animation: bannerReveal 950ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .banner-image {
          animation: bannerImageZoom 4200ms ease-out both;
        }

        .banner-light::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 0%,
            transparent 35%,
            rgba(255, 255, 255, 0.18) 48%,
            rgba(214, 170, 72, 0.22) 50%,
            rgba(255, 255, 255, 0.14) 52%,
            transparent 65%,
            transparent 100%
          );
          transform: translateX(-120%) skewX(-12deg);
          animation: bannerLightSweep 1150ms ease-out 120ms both;
        }

        @keyframes bannerReveal {
          0% {
            opacity: 0;
            filter: blur(10px);
            clip-path: inset(0 0 0 16%);
          }

          55% {
            opacity: 1;
            filter: blur(0);
          }

          100% {
            opacity: 1;
            filter: blur(0);
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes bannerImageZoom {
          0% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes bannerLightSweep {
          0% {
            transform: translateX(-120%) skewX(-12deg);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          100% {
            transform: translateX(120%) skewX(-12deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .banner-reveal,
          .banner-image,
          .banner-light::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  );

  return (
    <div className="container mx-auto">
      <Link to={currentBanner.title2 || "#"}>{bannerContent}</Link>
    </div>
  );
};

export default GlobalBanner;
