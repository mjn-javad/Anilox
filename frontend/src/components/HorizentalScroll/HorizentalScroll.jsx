import React from "react";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import apiClientBrand from "../../services/api-client";
import { useNavigate } from "react-router-dom";

const HorizentalScroll = () => {
  const [brands, setBrand] = useState([]);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const handleBrandClick = (brandName, index) => {
    setActiveIndex(index);
    setTimeout(() => {
      navigate(`/slider-shoes?brand=${encodeURIComponent(brandName)}`);
    }, 300);
  };

  useEffect(() => {
    apiClientBrand
      .get("")
      .then((res) => setBrand(res.data.data))
      .catch((err) => setError("Failed to load brands"));
  }, []);

  const scrollRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    handleScroll();
  }, [brands]);

  // رنگ‌های ملایم و متفاوت برای هر برند
  const getGradient = (index) => {
    const gradients = [
      // طلایی و کرم
      "from-amber-100/90 to-yellow-100/90 hover:from-amber-200/90 hover:to-yellow-200/90 border-amber-300/30",
      // نقره‌ای و طوسی مات
      "from-gray-200/90 to-slate-200/90 hover:from-gray-300/90 hover:to-slate-300/90 border-gray-400/20",
      // کرم و سفید شیری
      "from-stone-100/90 to-neutral-100/90 hover:from-stone-200/90 hover:to-neutral-200/90 border-stone-300/30",
      // طلایی تیره و برنزی
      "from-yellow-200/90 to-orange-200/90 hover:from-yellow-300/90 hover:to-orange-300/90 border-yellow-400/30",
      // مرواریدی و صورتی ملایم
      "from-rose-100/80 to-pink-100/80 hover:from-rose-200/90 hover:to-pink-200/90 border-rose-300/20",
      // خاکستری نقره‌ای
      "from-slate-200/90 to-gray-200/90 hover:from-slate-300/90 hover:to-gray-300/90 border-gray-500/20",
      // کرم طلایی
      "from-amber-50/90 to-yellow-50/90 hover:from-amber-100/90 hover:to-yellow-100/90 border-amber-200/40",
      // سفید مرواریدی با طیف آبی ملایم
      "from-sky-100/80 to-blue-100/80 hover:from-sky-200/90 hover:to-blue-200/90 border-sky-300/20",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="text-rose-500 text-center mb-4 font-medium bg-rose-50/50 backdrop-blur-sm py-3 rounded-2xl border border-rose-200/50">
          ⚠️ {error}
        </div>
      )}

      <div className="relative group">
        {/* دکمه چپ - با افکت ملایم */}
        {showLeftBtn && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 pointer-events-none">
            <div className="pointer-events-auto bg-gradient-to-r from-white/95 via-white/80 to-transparent pl-3 pr-10 py-6 rounded-r-3xl backdrop-blur-md transition-all duration-500 hover:pr-14">
              <button
                onClick={() => scroll("left")}
                className="p-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
              >
                <ChevronLeft
                  size={24}
                  className="text-gray-600 group-hover/btn:text-gray-900 transition-colors"
                />
              </button>
            </div>
          </div>
        )}

        {/* کانتینر اسکرول */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto py-8 gap-5 no-scrollbar scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {brands.map((brand, index) => (
            <button
              key={index}
              onClick={() => handleBrandClick(brand.name, index)}
              className={`flex-none transition-all duration-500 transform hover:scale-105 active:scale-95 relative group/brand ${
                activeIndex === index ? "scale-105" : ""
              }`}
              style={{
                animation: `floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.06}s both`,
              }}
            >
              <div
                className={`
                  relative px-10 py-5 rounded-2xl
                  bg-gradient-to-br ${getGradient(index)}
                  border border-white/30 shadow-lg hover:shadow-2xl
                  transition-all duration-500
                  backdrop-blur-sm
                  overflow-hidden
                  min-w-[140px]
                `}
              >
                {/* افکت شیشه‌ای پشت */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500" />

                {/* نقطه‌های نورانی متحرک */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl animate-pulse-slow" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-xl animate-pulse-slow delay-1000" />

                {/* آیکون اسپارکل */}
                <Sparkles
                  size={16}
                  className="absolute top-2 right-3 text-white/60 group-hover/brand:text-white/90 transition-colors duration-300 animate-spin-slow"
                />

                {/* متن برند */}
                <span className="relative text-base font-semibold text-gray-800/90 group-hover/brand:text-gray-900 transition-colors duration-300 tracking-wide drop-shadow-sm">
                  {brand.name}
                </span>

                {/* خط زیرین انیمیشنی */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-white/60 to-white/20 rounded-full group-hover/brand:w-3/4 transition-all duration-700 ease-out" />

                {/* رینگ هاله‌ای هنگام هاور */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover/brand:border-white/40 transition-all duration-500 scale-95 group-hover/brand:scale-100" />

                {/* افکت موجی در هاور */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/brand:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>

              {/* شماره برند */}
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full border border-gray-200/50 shadow-md flex items-center justify-center text-xs font-bold text-gray-500">
                {index + 1}
              </div>
            </button>
          ))}
        </div>

        {/* دکمه راست - با افکت ملایم */}
        {showRightBtn && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center z-20 pointer-events-none">
            <div className="pointer-events-auto bg-gradient-to-l from-white/95 via-white/80 to-transparent pr-3 pl-10 py-6 rounded-l-3xl backdrop-blur-md transition-all duration-500 hover:pl-14">
              <button
                onClick={() => scroll("right")}
                className="p-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
              >
                <ChevronRight
                  size={24}
                  className="text-gray-600 group-hover/btn:text-gray-900 transition-colors"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* استایل‌های اضافی */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes floatIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9) rotate(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes pulseSlow {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
        }

        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* بهبود سایه‌ها و افکت‌ها */
        .shadow-xl {
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
        }

        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        /* استایل هاور برای دکمه‌های کناری */
        .group:hover .absolute {
          opacity: 1;
        }

        .absolute {
          opacity: 0.85;
          transition: opacity 0.3s ease;
        }

        .group:hover .absolute {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default HorizentalScroll;
