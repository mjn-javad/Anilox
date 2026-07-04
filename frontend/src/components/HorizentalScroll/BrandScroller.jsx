import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClientBrand from "../../services/api-client";

const BrandScroller = ({
  title = "",
  subtitle = "",
  navigatePath = "/slider-shoes",
  defaultType = "",
}) => {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [canScroll, setCanScroll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const scrollRef = useRef(null);
  const animRef = useRef(null);
  const timerRef = useRef(null);

  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  const genderFromPage = useMemo(() => {
    const params = new URLSearchParams(search);
    const genderParam = params.get("gender");

    if (genderParam) return genderParam;

    const isMen =
      pathname === "/men" ||
      pathname.includes("men") ||
      genderParam === "men" ||
      genderParam === "male";

    return isMen ? "male" : "female";
  }, [pathname, search]);

  const movingBrands = useMemo(() => {
    if (!brands.length) return [];
    return [...brands, ...brands, ...brands];
  }, [brands]);

  useEffect(() => {
    apiClientBrand
      .get("")
      .then((res) => setBrands(res.data.data || []))
      .catch(() => setError("Failed to load brands"));
  }, []);

  const formatBrandForQuery = (brandName) => {
    return String(brandName || "")
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

        if (!cleanWord) return "";

        if (index === 0) return cleanWord;

        return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
      })
      .join("");
  };

  const pauseAuto = () => {
    pausedRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const resumeAuto = (delay = 1000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      draggingRef.current = false;
      pausedRef.current = false;
    }, delay);
  };

  const fixLoopPosition = () => {
    const el = scrollRef.current;
    if (!el) return;

    const onePart = el.scrollWidth / 3;
    if (!onePart) return;

    if (el.scrollLeft >= onePart * 2) {
      el.scrollLeft -= onePart;
    }

    if (el.scrollLeft <= onePart * 0.2) {
      el.scrollLeft += onePart;
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !brands.length) return;

    const setMiddle = () => {
      const onePart = el.scrollWidth / 3;

      if (onePart > 0) {
        el.scrollLeft = onePart;
      }

      setCanScroll(el.scrollWidth > el.clientWidth + 5);
    };

    const id = requestAnimationFrame(setMiddle);
    window.addEventListener("resize", setMiddle);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", setMiddle);
    };
  }, [brands.length]);

  useEffect(() => {
    if (!brands.length) return;

    const speed = 0.7;

    const move = () => {
      const el = scrollRef.current;

      if (el && el.scrollWidth > el.clientWidth) {
        fixLoopPosition();

        if (!pausedRef.current && !draggingRef.current) {
          el.scrollLeft += speed;
        }
      }

      animRef.current = requestAnimationFrame(move);
    };

    animRef.current = requestAnimationFrame(move);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [brands.length]);

  const handlePointerDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;

    pauseAuto();

    draggingRef.current = true;
    draggedRef.current = false;
    startXRef.current = e.clientX || 0;
    startScrollRef.current = el.scrollLeft;
  };

  const handlePointerMove = (e) => {
    const el = scrollRef.current;
    if (!el || !draggingRef.current) return;

    const diff = (e.clientX || 0) - startXRef.current;

    if (Math.abs(diff) > 8) {
      draggedRef.current = true;
      pauseAuto();
    }

    if (e.pointerType === "mouse") {
      el.scrollLeft = startScrollRef.current - diff;
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    resumeAuto(1000);

    setTimeout(() => {
      draggedRef.current = false;
    }, 180);
  };

  const handleWheel = () => {
    pauseAuto();
    resumeAuto(1000);
  };

  const handleBrandClick = (brandName, index) => {
    if (draggedRef.current) return;

    const formattedBrand = formatBrandForQuery(brandName);

    const params = new URLSearchParams(search);

    if (!params.get("gender")) {
      params.set("gender", genderFromPage);
    }

    if (defaultType && !params.get("type")) {
      params.set("type", defaultType);
    }

    params.set("brand", formattedBrand);

    setActiveIndex(index);

    navigate(`${navigatePath}?${params.toString()}`);
  };

  const scrollByButton = (direction) => {
    const el = scrollRef.current;
    if (!el) return;

    pauseAuto();

    el.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });

    resumeAuto(1000);
  };

  const getBrandGradient = (index) => {
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

  return (
    <section>
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200/50 bg-rose-50/60 py-3 text-center font-medium text-rose-500 backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}

      {/* <div className="mb-4 text-center">
        <p className="mb-2 text-[10px] md:text-xs uppercase tracking-[0.35em] text-gray-400">
          {subtitle}
        </p>

        <h2 className="text-2xl md:text-4xl font-light uppercase tracking-[0.18em] text-gray-900">
          {title}
        </h2>

        <div className="mx-auto mt-4 h-px w-16 md:w-20 bg-gray-300" />
      </div> */}

      <div className="relative py-0 md:py-0">
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 md:w-24 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 md:w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />

        {canScroll && (
          <button
            type="button"
            onClick={() => scrollByButton("left")}
            className="hidden sm:flex absolute left-2 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-110"
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
          onWheel={handleWheel}
          className="
            no-scrollbar flex gap-3 md:gap-5 overflow-x-auto
            px-1 py-3 md:py-5
            cursor-grab active:cursor-grabbing
            select-none touch-pan-x overscroll-x-contain
          "
        >
          {movingBrands.length ? (
            movingBrands.map((brand, index) => {
              const originalIndex = index % brands.length;

              return (
                <button
                  key={`${brand.id || brand.name || "brand"}-${index}`}
                  type="button"
                  onClick={() => handleBrandClick(brand.name, originalIndex)}
                  className={`
                    group/brand relative flex-none
                    transition-transform duration-300 hover:scale-105 active:scale-95
                    ${activeIndex === originalIndex ? "scale-105" : ""}
                  `}
                >
                  <div
                    className={`
                      relative overflow-hidden rounded-xl md:rounded-2xl
                      bg-gradient-to-br ${getBrandGradient(originalIndex)}
                      border border-white/30
                      px-5 py-3 md:px-10 md:py-5
                      min-w-[92px] sm:min-w-[115px] md:min-w-[140px]
                      shadow-md md:shadow-lg hover:shadow-2xl
                      transition-all duration-500
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/brand:opacity-100" />

                    <div className="absolute -top-8 -right-8 md:-top-10 md:-right-10 h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-2xl animate-pulse-slow" />

                    <div className="absolute -bottom-8 -left-8 md:-bottom-10 md:-left-10 h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-tr from-white/20 to-transparent blur-xl animate-pulse-slow delay-1000" />

                    <Sparkles
                      size={12}
                      className="absolute top-1.5 right-2 md:top-2 md:right-3 text-white/60 transition-colors duration-300 group-hover/brand:text-white/90 animate-spin-slow"
                    />

                    <span className="relative block whitespace-nowrap text-xs sm:text-sm md:text-base font-semibold tracking-wide text-gray-800/90 drop-shadow-sm transition-colors duration-300 group-hover/brand:text-gray-900">
                      {brand.name}
                    </span>

                    <div className="absolute bottom-1.5 md:bottom-2 left-1/2 h-0.5 w-6 md:w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-white/60 to-white/20 transition-all duration-700 ease-out group-hover/brand:w-3/4" />

                    <div className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-white/0 transition-all duration-500 group-hover/brand:border-white/40" />

                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover/brand:translate-x-full" />
                  </div>

                  <div className="hidden sm:flex absolute -top-2 -right-2 h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full border border-gray-200/50 bg-white/90 text-[10px] md:text-xs font-bold text-gray-500 shadow-md backdrop-blur-md">
                    {originalIndex + 1}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="w-full py-6 text-center text-sm text-gray-400">
              No brands found
            </div>
          )}
        </div>

        {canScroll && (
          <button
            type="button"
            onClick={() => scrollByButton("right")}
            className="hidden sm:flex absolute right-2 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-110"
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
    </section>
  );
};

export default BrandScroller;
