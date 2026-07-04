import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import apiClientBrand from "../../services/api-client";
import { useNavigate, useLocation } from "react-router-dom";

const HorizentalScroll = () => {
  const [brands, setBrand] = useState([]);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeTypeIndex, setActiveTypeIndex] = useState(null);
  const [canScroll, setCanScroll] = useState(false);

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const isPausedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const isMen = useMemo(() => {
    const genderParam = new URLSearchParams(search).get("gender");

    return (
      pathname === "/men" || genderParam === "men" || genderParam === "male"
    );
  }, [pathname, search]);

  const gender = isMen ? "male" : "female";

  const shopTypes = [
    {
      id: 1,
      title: "Shoes",
      type: "shoe",
      icon: "👟",
    },
    {
      id: 2,
      title: "Bags",
      type: "bag",
      icon: "👜",
    },
    {
      id: 3,
      title: "Glasses",
      type: "glasses",
      icon: "🕶️",
    },
    {
      id: 4,
      title: "Luggage",
      type: "luggage",
      icon: "🧳",
    },
  ];

  const movingBrands = useMemo(() => {
    if (!brands.length) return [];

    // سه بار تکرار می‌کنیم تا کاربر بتواند راحت چپ و راست اسکرول کند
    return [...brands, ...brands, ...brands];
  }, [brands]);

  useEffect(() => {
    apiClientBrand
      .get("")
      .then((res) => setBrand(res.data.data || []))
      .catch(() => setError("Failed to load brands"));
  }, []);

  const pauseAutoScroll = () => {
    isPausedRef.current = true;

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
  };

  const resumeAutoScroll = (delay = 1000) => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, delay);
  };

  const handlePointerDown = (e) => {
    pauseAutoScroll();

    dragStartXRef.current = e.clientX || 0;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (e) => {
    const currentX = e.clientX || 0;

    if (Math.abs(currentX - dragStartXRef.current) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handlePointerUp = () => {
    resumeAutoScroll(1200);

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  const handleWheel = () => {
    pauseAutoScroll();
    resumeAutoScroll(1200);
  };

  const handleTypeClick = (type, index) => {
    setActiveTypeIndex(index);

    setTimeout(() => {
      navigate(
        `/slider-shoes?type=${encodeURIComponent(type)}&gender=${gender}`,
      );
    }, 200);
  };

  const handleBrandClick = (brandName, index) => {
    // اگر کاربر با انگشت کشیده بود، کلیک حساب نشود
    if (hasDraggedRef.current) return;

    setActiveIndex(index);

    setTimeout(() => {
      navigate(
        `/slider-shoes?brand=${encodeURIComponent(brandName)}&gender=${gender}`,
      );
    }, 200);
  };

  const scrollBrands = (direction) => {
    const el = scrollRef.current;
    if (!el) return;

    pauseAutoScroll();

    const amount = direction === "left" ? -260 : 260;

    el.scrollBy({
      left: amount,
      behavior: "smooth",
    });

    resumeAutoScroll(1300);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;

    const setInitialPosition = () => {
      const oneSetWidth = el.scrollWidth / 3;

      if (oneSetWidth > 0) {
        el.scrollLeft = oneSetWidth;
        setCanScroll(el.scrollWidth > el.clientWidth + 5);
      }
    };

    const id = requestAnimationFrame(setInitialPosition);

    const handleResize = () => {
      const oneSetWidth = el.scrollWidth / 3;
      setCanScroll(el.scrollWidth > el.clientWidth + 5);

      if (oneSetWidth > 0 && el.scrollLeft < oneSetWidth * 0.3) {
        el.scrollLeft = oneSetWidth;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", handleResize);
    };
  }, [brands.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;

    const speed = 0.28;

    const autoScroll = () => {
      const oneSetWidth = el.scrollWidth / 3;

      if (oneSetWidth > 0 && el.scrollWidth > el.clientWidth) {
        // وقتی خیلی رفت سمت راست، بدون دیده شدن برش گردان وسط
        if (el.scrollLeft >= oneSetWidth * 2) {
          el.scrollLeft -= oneSetWidth;
        }

        // وقتی خیلی رفت سمت چپ، بدون دیده شدن ببرش وسط
        if (el.scrollLeft <= oneSetWidth * 0.15) {
          el.scrollLeft += oneSetWidth;
        }

        if (!isPausedRef.current) {
          el.scrollLeft += speed;
        }
      }

      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [brands.length]);

  const getGradient = (index) => {
    const gradients = [
      "from-amber-100/90 to-yellow-100/90 hover:from-amber-200/90 hover:to-yellow-200/90 border-amber-300/30",
      "from-gray-200/90 to-slate-200/90 hover:from-gray-300/90 hover:to-slate-300/90 border-gray-400/20",
      "from-stone-100/90 to-neutral-100/90 hover:from-stone-200/90 hover:to-neutral-200/90 border-stone-300/30",
      "from-yellow-200/90 to-orange-200/90 hover:from-yellow-300/90 hover:to-orange-300/90 border-yellow-400/30",
      "from-rose-100/80 to-pink-100/80 hover:from-rose-200/90 hover:to-pink-200/90 border-rose-300/20",
      "from-slate-200/90 to-gray-200/90 hover:from-slate-300/90 hover:to-gray-300/90 border-gray-500/20",
      "from-amber-50/90 to-yellow-50/90 hover:from-amber-100/90 hover:to-yellow-100/90 border-amber-200/40",
      "from-sky-100/80 to-blue-100/80 hover:from-sky-200/90 hover:to-blue-200/90 border-sky-300/20",
    ];

    return gradients[index % gradients.length];
  };

  const getTypeGradient = (index) => {
    const gradients = [
      "from-neutral-950 to-stone-800 text-white border-neutral-700",
      "from-stone-900 to-neutral-800 text-white border-stone-700",
      "from-zinc-900 to-gray-800 text-white border-zinc-700",
      "from-black to-neutral-800 text-white border-neutral-700",
    ];

    return gradients[index % gradients.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-8 md:py-10">
      {error && (
        <div className="text-rose-500 text-center mb-4 font-medium bg-rose-50/50 backdrop-blur-sm py-3 rounded-2xl border border-rose-200/50">
          ⚠️ {error}
        </div>
      )}

      {/* Shop By Type */}
      <div className="mb-10 md:mb-14">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.35em] text-gray-400 mb-2">
            Explore Collection
          </p>

          <h2 className="text-2xl md:text-4xl font-light tracking-[0.14em] md:tracking-[0.18em] uppercase text-gray-900">
            Shop by Type
          </h2>

          <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {shopTypes.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleTypeClick(item.type, index)}
              className={`
                relative overflow-hidden rounded-2xl md:rounded-3xl border 
                bg-gradient-to-br ${getTypeGradient(index)}
                px-4 md:px-5 py-5 md:py-8
                shadow-lg md:shadow-xl hover:shadow-2xl
                transition-all duration-500 hover:-translate-y-1 active:scale-95
                group/type
                ${activeTypeIndex === index ? "scale-[1.03]" : ""}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 opacity-0 group-hover/type:opacity-100 transition-opacity duration-500" />

              <div className="absolute -top-12 -right-12 w-28 md:w-32 h-28 md:h-32 bg-white/10 rounded-full blur-2xl group-hover/type:scale-125 transition-transform duration-700" />

              <Sparkles
                size={15}
                className="absolute top-3 md:top-4 right-3 md:right-4 text-white/50 group-hover/type:text-white transition-colors duration-300 animate-spin-slow"
              />

              <div className="relative flex flex-col items-center justify-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-2xl md:text-3xl shadow-inner">
                  {item.icon}
                </div>

                <div>
                  <h3 className="text-xs md:text-lg font-medium tracking-[0.14em] md:tracking-[0.18em] uppercase">
                    {item.title}
                  </h3>

                  <p className="text-[9px] md:text-xs text-white/50 mt-1 md:mt-2 tracking-widest uppercase">
                    View Products
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover/type:scale-x-100 transition-transform duration-700" />

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/type:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>
          ))}
        </div>
      </div>

      {/* Shop By Category */}
      <div className="text-center mb-4">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.35em] text-gray-400 mb-2">
          Luxury Brands
        </p>

        <h2 className="text-2xl md:text-4xl font-light tracking-[0.14em] md:tracking-[0.18em] uppercase text-gray-900">
          Shop by Category
        </h2>

        <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mt-4" />
      </div>

      {/* Moving + Draggable Brands */}
      <div className="relative py-5 md:py-8">
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 md:w-24 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 md:w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />

        {canScroll && (
          <button
            onClick={() => scrollBrands("left")}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-lg backdrop-blur-md hover:scale-110 transition"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        )}

        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={pauseAutoScroll}
          onMouseLeave={() => resumeAutoScroll(700)}
          onWheel={handleWheel}
          className="
            flex gap-3 md:gap-5 overflow-x-auto no-scrollbar
            py-3 md:py-5 px-1
            scroll-smooth
            cursor-grab active:cursor-grabbing
            select-none
            touch-pan-x
          "
        >
          {movingBrands.length > 0 ? (
            movingBrands.map((brand, index) => {
              const originalIndex = index % brands.length;

              return (
                <button
                  key={`${brand.id || brand.name || "brand"}-${index}`}
                  onClick={() => handleBrandClick(brand.name, originalIndex)}
                  className={`
                    flex-none relative group/brand
                    transition-transform duration-300 hover:scale-105 active:scale-95
                    ${activeIndex === originalIndex ? "scale-105" : ""}
                  `}
                >
                  <div
                    className={`
                      relative overflow-hidden rounded-xl md:rounded-2xl
                      bg-gradient-to-br ${getGradient(originalIndex)}
                      border border-white/30
                      px-5 py-3 md:px-10 md:py-5
                      min-w-[92px] sm:min-w-[115px] md:min-w-[140px]
                      shadow-md md:shadow-lg hover:shadow-2xl
                      transition-all duration-500
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500" />

                    <div className="absolute -top-8 md:-top-10 -right-8 md:-right-10 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl animate-pulse-slow" />

                    <div className="absolute -bottom-8 md:-bottom-10 -left-8 md:-left-10 w-20 md:w-24 h-20 md:h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-xl animate-pulse-slow delay-1000" />

                    <Sparkles
                      size={12}
                      className="absolute top-1.5 md:top-2 right-2 md:right-3 text-white/60 group-hover/brand:text-white/90 transition-colors duration-300 animate-spin-slow"
                    />

                    <span className="relative block whitespace-nowrap text-xs sm:text-sm md:text-base font-semibold text-gray-800/90 group-hover/brand:text-gray-900 transition-colors duration-300 tracking-wide drop-shadow-sm">
                      {brand.name}
                    </span>

                    <div className="absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 w-6 md:w-8 h-0.5 bg-gradient-to-r from-white/60 to-white/20 rounded-full group-hover/brand:w-3/4 transition-all duration-700 ease-out" />

                    <div className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-white/0 group-hover/brand:border-white/40 transition-all duration-500" />

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/brand:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </div>

                  <div className="hidden sm:flex absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-white/90 backdrop-blur-md rounded-full border border-gray-200/50 shadow-md items-center justify-center text-[10px] md:text-xs font-bold text-gray-500">
                    {originalIndex + 1}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="w-full text-center text-sm text-gray-400 py-6">
              No brands found
            </div>
          )}
        </div>

        {canScroll && (
          <button
            onClick={() => scrollBrands("right")}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-lg backdrop-blur-md hover:scale-110 transition"
          >
            <ChevronRight size={22} className="text-gray-700" />
          </button>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
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
      `}</style>
    </div>
  );
};

export default HorizentalScroll;
