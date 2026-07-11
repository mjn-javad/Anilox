import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const IMAGE_BASE_URL = "/api/images/banners/";

const BannerButton = ({ title, link }) => {
  if (!title || !link) return null;

  const isExternal =
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("tel:") ||
    link.startsWith("mailto:");

  const buttonClass = `
    inline-flex
    items-center
    justify-center
    border
    border-white/80
    bg-black/20
    px-3
    py-1.5
    text-[10px]
    font-medium
    uppercase
    tracking-[0.12em]
    text-white
    backdrop-blur-sm
    transition-all
    duration-300
    hover:bg-white
    hover:text-black
    sm:px-5
    sm:py-2.5
    sm:text-xs
  `;

  if (isExternal) {
    return (
      <a href={link} target="_blank" rel="noreferrer" className={buttonClass}>
        {title}
      </a>
    );
  }

  return (
    <Link to={link} className={buttonClass}>
      {title}
    </Link>
  );
};

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

        const finalBanners = Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];

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
        console.log("Get banner error:", err);

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

  useEffect(() => {
    setShowText(false);

    const timer = setTimeout(() => {
      setShowText(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [currentIndex]);

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
        <div className="h-[165px] w-full animate-pulse bg-gray-100 sm:h-[360px] md:h-[520px] lg:h-[660px]" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  return (
    <div className="container mx-auto">
      <div
        key={currentIndex}
        className="banner-reveal group relative h-[165px] w-full overflow-hidden bg-gray-100 sm:h-[360px] md:h-[520px] lg:h-[660px]"
      >
        <img
          src={getImageUrl(currentBanner.image)}
          alt={currentBanner.title1 || "brand banner"}
          className="
            banner-image
            h-full
            w-full
            object-cover
            object-center
            transition-transform
            duration-700
            ease-out
            lg:group-hover:scale-105
          "
        />

        {currentBanner.bannerLink && (
          <Link
            to={currentBanner.bannerLink}
            aria-label={currentBanner.title1 || "مشاهده بنر"}
            className="absolute inset-0 z-10"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent" />

        <div className="banner-light pointer-events-none absolute inset-0" />

        {/* عنوان‌ها در بالای تصویر */}
        <div
          className={`
            pointer-events-none
            absolute
            left-4
            top-4
            z-20
            max-w-[75%]
            transition-all
            duration-700
            ease-out
            sm:left-10
            sm:top-10
            md:left-16
            md:top-14
            ${
              showText
                ? "translate-x-0 opacity-100 blur-0"
                : "-translate-x-5 opacity-0 blur-sm"
            }
          `}
        >
          {currentBanner.title1 && (
            <h1 className="text-lg font-light uppercase leading-tight tracking-[0.14em] text-white drop-shadow-xl sm:text-4xl md:text-5xl">
              {currentBanner.title1}
            </h1>
          )}

          {currentBanner.title2 && (
            <p className="mt-1.5 text-xs font-light tracking-[0.08em] text-white/90 drop-shadow-lg sm:mt-3 sm:text-lg md:text-xl">
              {currentBanner.title2}
            </p>
          )}

          <div className="mt-2 h-px w-10 bg-white/90 drop-shadow-lg sm:mt-4 sm:w-16" />
        </div>

        {/* دکمه‌ها در پایین تصویر */}
        <div className="absolute bottom-4 left-4 z-30 flex flex-wrap items-center gap-2 sm:bottom-8 sm:left-10 sm:gap-3 md:left-16">
          <BannerButton
            title={currentBanner.btnTitle1}
            link={currentBanner.btnLink1}
          />

          <BannerButton
            title={currentBanner.btnTitle2}
            link={currentBanner.btnLink2}
          />
        </div>

        {/* نقاط اسلایدر */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 sm:bottom-8 sm:right-10 sm:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`نمایش بنر ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                  index === currentIndex
                    ? "w-6 bg-white sm:w-8"
                    : "w-1.5 bg-white/50 hover:bg-white/80 sm:w-2"
                }`}
              />
            ))}
          </div>
        )}

        <style>{`
          .banner-reveal {
            animation: bannerReveal 950ms
              cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .banner-image {
            animation: none;
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

          @media (min-width: 640px) {
            .banner-image {
              animation: bannerImageZoom 4200ms ease-out both;
            }
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
    </div>
  );
};

export default GlobalBanner;
