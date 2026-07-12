import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClientBrand from "../../services/api-client";

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

const formatBrand = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      if (!cleanWord) return "";

      return index === 0
        ? cleanWord
        : cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    })
    .join("");

const BrandScroller = ({
  brands: receivedBrands,
  navigatePath = "/slider-shoes",
  defaultType = "",
}) => {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [canScroll, setCanScroll] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);

  const scrollState = useRef({
    paused: false,
    dragging: false,
    dragged: false,
    startX: 0,
    startScroll: 0,
    position: 0,
    lastTime: 0,
  });

  const genderFromPage = useMemo(() => {
    const value = new URLSearchParams(search).get("gender")?.toLowerCase();

    if (value === "male" || value === "men") return "male";
    if (value === "female" || value === "women") return "female";

    const path = pathname.toLowerCase();

    return path === "/men" || path.startsWith("/men/") ? "male" : "female";
  }, [pathname, search]);

  const movingBrands = useMemo(() => {
    if (!brands.length) return [];

    return isLooping ? [...brands, ...brands, ...brands] : brands;
  }, [brands, isLooping]);

  useEffect(() => {
    if (Array.isArray(receivedBrands)) {
      setBrands(receivedBrands);
      setError("");
      return;
    }

    apiClientBrand
      .get("")
      .then((res) => {
        setBrands(res.data?.data || []);
        setError("");
      })
      .catch((err) => {
        console.error("Get brands error:", err);
        setError("Failed to load brands");
      });
  }, [receivedBrands]);

  const pauseAuto = () => {
    scrollState.current.paused = true;
    clearTimeout(timerRef.current);
  };

  const resumeAuto = (delay = 1000) => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      scrollState.current.dragging = false;
      scrollState.current.paused = false;
    }, delay);
  };

  useEffect(() => {
    const element = scrollRef.current;

    if (!element || !brands.length) return;

    const initialize = () => {
      const originalWidth = isLooping
        ? element.scrollWidth / 3
        : element.scrollWidth;

      const needsLoop = originalWidth > element.clientWidth + 5;

      if (needsLoop !== isLooping) {
        setIsLooping(needsLoop);
        return;
      }

      setCanScroll(needsLoop);

      if (needsLoop) {
        const middle = element.scrollWidth / 3;

        element.scrollLeft = middle;
        scrollState.current.position = middle;
      } else {
        element.scrollLeft = 0;
        scrollState.current.position = 0;
      }
    };

    const frameId = requestAnimationFrame(() =>
      requestAnimationFrame(initialize),
    );

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(initialize)
        : null;

    observer?.observe(element);
    window.addEventListener("resize", initialize);

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener("resize", initialize);
    };
  }, [brands, isLooping]);

  useEffect(() => {
    if (!brands.length || !isLooping) return;

    const speed = 42;

    const move = (time) => {
      const element = scrollRef.current;
      const state = scrollState.current;

      const elapsed = state.lastTime ? Math.min(time - state.lastTime, 50) : 0;

      state.lastTime = time;

      if (element && !state.paused && !state.dragging) {
        const onePart = element.scrollWidth / 3;

        state.position += (speed * elapsed) / 1000;

        if (state.position > onePart * 1.5) {
          state.position -= onePart;
        }

        element.scrollLeft = state.position;
      }

      animationRef.current = requestAnimationFrame(move);
    };

    scrollState.current.lastTime = 0;
    animationRef.current = requestAnimationFrame(move);

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timerRef.current);
    };
  }, [brands.length, isLooping]);

  const normalizeInfiniteScroll = () => {
    const element = scrollRef.current;
    const state = scrollState.current;

    if (!element) return;

    let position = element.scrollLeft;

    if (isLooping) {
      const onePart = element.scrollWidth / 3;

      while (position < onePart * 0.5) {
        position += onePart;
      }

      while (position > onePart * 1.5) {
        position -= onePart;
      }

      if (position !== element.scrollLeft) {
        element.scrollLeft = position;
      }
    }

    state.position = position;
  };

  const handlePointerDown = (event) => {
    const element = scrollRef.current;
    if (!element) return;

    const state = scrollState.current;

    pauseAuto();

    state.dragging = true;
    state.dragged = false;
    state.startX = event.clientX;
    state.startScroll = element.scrollLeft;
    state.position = element.scrollLeft;
  };

  const handlePointerMove = (event) => {
    const element = scrollRef.current;
    const state = scrollState.current;

    if (!element || !state.dragging) return;

    const difference = event.clientX - state.startX;

    if (Math.abs(difference) > 8 && !state.dragged) {
      state.dragged = true;

      if (event.pointerType === "mouse") {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    }

    if (event.pointerType === "mouse" && state.dragged) {
      state.position = state.startScroll - difference;
      element.scrollLeft = state.position;
    }
  };

  const handlePointerUp = (event) => {
    const element = scrollRef.current;
    const state = scrollState.current;

    if (element) {
      state.position = element.scrollLeft;
    }

    state.dragging = false;

    if (
      event?.pointerType === "mouse" &&
      event.currentTarget?.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    normalizeInfiniteScroll();
    resumeAuto();

    setTimeout(() => {
      state.dragged = false;
    }, 180);
  };

  const handleBrandClick = (brand, index) => {
    if (scrollState.current.dragged) return;

    const params = new URLSearchParams(search);

    if (!params.get("gender")) {
      params.set("gender", genderFromPage);
    }

    if (defaultType && !params.get("type")) {
      params.set("type", defaultType);
    }

    params.set("brand", brand.slug || formatBrand(brand.name));

    setActiveIndex(index);
    navigate(`${navigatePath}?${params.toString()}`);
  };

  const scrollByButton = (direction) => {
    const element = scrollRef.current;
    if (!element) return;

    pauseAuto();

    const nextPosition =
      element.scrollLeft + (direction === "left" ? -280 : 280);

    scrollState.current.position = nextPosition;

    element.scrollTo({
      left: nextPosition,
      behavior: "smooth",
    });

    resumeAuto();
  };

  return (
    <section>
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200/50 bg-rose-50/60 py-3 text-center font-medium text-rose-500 backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 bg-gradient-to-r from-white via-white/80 to-transparent md:w-24" />

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 bg-gradient-to-l from-white via-white/80 to-transparent md:w-24" />

        {canScroll && (
          <button
            type="button"
            onClick={() => scrollByButton("left")}
            className="absolute left-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-110 sm:flex"
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
          onScroll={normalizeInfiniteScroll}
          onWheel={() => {
            pauseAuto();
            resumeAuto();
          }}
          className={`no-scrollbar flex cursor-grab select-none gap-3 overflow-x-auto overscroll-x-contain px-1 py-3 active:cursor-grabbing md:gap-5 md:py-5 ${
            !isLooping ? "justify-center" : ""
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
        >
          {movingBrands.length ? (
            movingBrands.map((brand, index) => {
              const originalIndex = index % brands.length;

              return (
                <button
                  key={`${brand.id || brand.name}-${index}`}
                  type="button"
                  onClick={() => handleBrandClick(brand, originalIndex)}
                  className={`group/brand relative flex-none transition-transform duration-300 hover:scale-105 active:scale-95 ${
                    activeIndex === originalIndex ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`
                      relative min-w-[92px] overflow-hidden rounded-xl
                      border border-white/30 bg-gradient-to-br
                      px-5 py-3 shadow-md transition-all duration-500
                      hover:shadow-2xl sm:min-w-[115px]
                      md:min-w-[140px] md:rounded-2xl md:px-10
                      md:py-5 md:shadow-lg
                      ${gradients[originalIndex % gradients.length]}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/brand:opacity-100" />

                    <div className="animate-pulse-slow absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-2xl md:-right-10 md:-top-10 md:h-32 md:w-32" />

                    <div className="animate-pulse-slow delay-1000 absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-gradient-to-tr from-white/20 to-transparent blur-xl md:-bottom-10 md:-left-10 md:h-24 md:w-24" />

                    <Sparkles
                      size={12}
                      className="animate-spin-slow absolute right-2 top-1.5 text-white/60 group-hover/brand:text-white/90 md:right-3 md:top-2"
                    />

                    <span className="relative block whitespace-nowrap text-xs font-semibold tracking-wide text-gray-800/90 drop-shadow-sm sm:text-sm md:text-base">
                      {brand.name}
                    </span>

                    <div className="absolute bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-white/60 to-white/20 transition-all duration-700 group-hover/brand:w-3/4 md:bottom-2 md:w-8" />

                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/brand:translate-x-full" />
                  </div>

                  <div className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200/50 bg-white/90 text-[10px] font-bold text-gray-500 shadow-md sm:flex md:h-7 md:w-7 md:text-xs">
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
            className="absolute right-2 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-md transition hover:scale-110 sm:flex"
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
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }

          50% {
            transform: scale(1.2) rotate(10deg);
          }
        }

        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default BrandScroller;
