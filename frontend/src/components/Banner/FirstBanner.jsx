import React, { useState, useEffect } from "react";
import Button from "../Shared/Button";
import apiClientBanner from "../../services/api-client_banner";
import LoadingSpinner from "../Shared/LoadingSpinner";
import MessageAlert from "../Shared/MessageAlert";

const FirstBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  // افکت برای تغییر خودکار اسلایدها
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // هر ۵ ثانیه یکبار

    return () => clearInterval(interval); // پاک کردن interval هنگام unmount
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiClientBanner.get("/");
      setBanners(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  // ساخت آدرس کامل تصویر
  const getImageUrl = (imageName) => {
    const baseUrl = `http://localhost:4000/images/banners/${imageName}`;
    return baseUrl;
  };

  // رفتن به اسلاید بعدی
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  // رفتن به اسلاید قبلی
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  };

  // رفتن به اسلاید خاص با نقطه‌ها
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <MessageAlert message={error} type="error" />;
  }

  if (banners.length === 0) {
    return <MessageAlert message="هیچ بنری یافت نشد" type="info" />;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      {/* اسلایدها */}
      <div
        className="relative transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className="flex">
          {banners.map((banner, index) => (
            <div key={banner.id || index} className="min-w-full relative">
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title || "Banner"}
                className="w-full h-[400px] sm:h-[500px] md:h-[600px] object-cover"
              />

              {/* محتوای متنی بنر - می‌تواند داینامیک باشد */}
              <div className="absolute inset-0 flex items-center justify-start">
                <div className="absolute bottom-1 sm:bottom-10 left-1 sm:left-10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="sm:1xl md:text-3xl sm:mb-2 color text-primary">
                      {banner.title1 || "Go Like Never Before"}
                    </h1>
                    <h1 className="sm:2xl md:text-5xl uppercase sm:mb-4">
                      {banner.title2 || "Javad Electronic Shop"}
                    </h1>
                    <Button
                      text="Shop Now"
                      bgColor="bg-white"
                      textColor="text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* دکمه قبلی */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* دکمه بعدی */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* نقطه‌های ناوبری (indicator dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FirstBanner;
