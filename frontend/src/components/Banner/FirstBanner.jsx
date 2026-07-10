import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const IMAGE_BASE_URL = "http://localhost:4000/images/banners/";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${IMAGE_BASE_URL}${image}`;
};

const FirstBanner = ({ gender }) => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(false);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleScreenChange = (event) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  const getSortOrder = () => {
    if (gender === "female") {
      return isDesktop ? 2 : 1;
    }

    if (gender === "male") {
      return isDesktop ? 4 : 3;
    }

    return null;
  };

  const sortOrder = getSortOrder();

  useEffect(() => {
    if (!sortOrder) {
      setBanners([]);
      setError("gender باید male یا female باشد");
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setShowText(false);

    apiClientBanner
      .get(`/${sortOrder}`)
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
            const image = new Image();
            image.src = getImageUrl(banner.image);
          }
        });
      })
      .catch((err) => {
        console.log("Get banner error:", err);

        if (isMounted) {
          setError("خطا در دریافت اطلاعات بنر");
          setBanners([]);
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
  }, [sortOrder]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;

    setShowText(false);

    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 700);

    return () => clearTimeout(textTimer);
  }, [currentIndex, banners.length]);

  const handleBannerClick = (event) => {
    const currentBanner = banners[currentIndex];

    if (!currentBanner?.bannerLink) return;

    if (event.target.closest("a")) return;
    if (event.target.closest("[data-banner-dot]")) return;

    navigate(currentBanner.bannerLink);
  };

  const handleDotClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    if (index === currentIndex) return;

    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-stone-100">
        <div className="w-full h-[520px] sm:h-[620px] lg:h-[720px] bg-stone-100 animate-pulse" />
      </section>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) {
    return null;
  }

  const hasButtons = currentBanner.btnTitle1 || currentBanner.btnTitle2;

  return (
    <section
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[720px] overflow-hidden bg-stone-100"
      onClick={handleBannerClick}
    >
      {banners.map((banner, index) => (
        <img
          key={banner.id || index}
          src={getImageUrl(banner.image)}
          alt={banner.title1 || banner.title2 || "Modern Luxury Banner"}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-[1.02]"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/5 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-6 sm:px-10 md:px-16 lg:px-20">
          <div
            className={`max-w-[430px] transition-all duration-700 ease-out ${
              showText
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-6"
            }`}
          >
            {currentBanner.title1 && (
              <h1 className="font-serif text-[42px] sm:text-[58px] md:text-[72px] leading-[0.95] text-black tracking-tight whitespace-pre-line">
                {currentBanner.title1.replace(/\\n/g, "\n")}
              </h1>
            )}

            {currentBanner.title2 && (
              <p className="mt-6 max-w-[380px] text-sm sm:text-base md:text-lg leading-7 lg:text-black text-gray-200 whitespace-pre-line">
                {currentBanner.title2.replace(/\\n/g, "\n")}
              </p>
            )}

            {hasButtons && (
              <div className="mt-8 flex flex-col gap-4 w-[230px] sm:w-[260px]">
                {currentBanner.btnTitle1 && (
                  <Link
                    to={currentBanner.btnLink1 || "#"}
                    className="h-12 flex items-center justify-center bg-black text-white text-xs sm:text-sm tracking-[0.28em] uppercase transition-all duration-300 hover:bg-zinc-800"
                  >
                    {currentBanner.btnTitle1}
                  </Link>
                )}

                {currentBanner.btnTitle2 && (
                  <Link
                    to={currentBanner.btnLink2 || "#"}
                    className="h-12 flex items-center justify-center border border-white text-white text-xs sm:text-sm tracking-[0.28em] uppercase transition-all duration-300 hover:bg-white hover:text-black lg:border-black lg:text-black lg:hover:bg-black lg:hover:text-white"
                  >
                    {currentBanner.btnTitle2}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {banners.map((banner, index) => (
            <button
              key={banner.id || index}
              type="button"
              data-banner-dot
              aria-label={`نمایش بنر ${index + 1}`}
              onClick={(event) => handleDotClick(event, index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white shadow-md"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FirstBanner;
