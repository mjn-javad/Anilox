import React, { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ShopByType = ({
  title = "Shop by Type",
  subtitle = "Explore Collection",
  navigatePath = "/slider-shoes",
}) => {
  const [activeTypeIndex, setActiveTypeIndex] = useState(null);

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const gender = useMemo(() => {
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

  const shopTypes = [
    { title: "Shoes", type: "shoe", icon: "👟" },
    { title: "Bags", type: "bag", icon: "👜" },
    { title: "Glasses", type: "glasses", icon: "🕶️" },
    { title: "Luggage", type: "luggage", icon: "🧳" },
  ];

  const handleTypeClick = (type, index) => {
    const params = new URLSearchParams(search);

    params.set("type", type);

    if (!params.get("gender")) {
      params.set("gender", gender);
    }

    params.delete("brand");

    setActiveTypeIndex(index);

    navigate(`${navigatePath}?${params.toString()}`);
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
    <section className="mb-10 md:mb-14">
      <div className="mb-6 md:mb-8 text-center">
        <p className="mb-2 text-[10px] md:text-xs uppercase tracking-[0.35em] text-gray-400">
          {subtitle}
        </p>

        <h2 className="text-2xl md:text-4xl font-light uppercase tracking-[0.18em] text-gray-900">
          {title}
        </h2>

        <div className="mx-auto mt-4 h-px w-16 md:w-20 bg-gray-300" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {shopTypes.map((item, index) => (
          <button
            key={item.type}
            type="button"
            onClick={() => handleTypeClick(item.type, index)}
            className={`
              group/type relative overflow-hidden rounded-2xl md:rounded-3xl border
              bg-gradient-to-br ${getTypeGradient(index)}
              px-4 md:px-5 py-5 md:py-8
              shadow-lg md:shadow-xl hover:shadow-2xl
              transition-all duration-500 hover:-translate-y-1 active:scale-95
              ${activeTypeIndex === index ? "scale-[1.03]" : ""}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 opacity-0 transition-opacity duration-500 group-hover/type:opacity-100" />

            <div className="absolute -top-12 -right-12 h-28 w-28 md:h-32 md:w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover/type:scale-125" />

            <Sparkles
              size={15}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-white/50 transition-colors duration-300 group-hover/type:text-white animate-spin-slow"
            />

            <div className="relative flex flex-col items-center justify-center gap-3 md:gap-4">
              <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-xl md:rounded-2xl border border-white/15 bg-white/10 text-2xl md:text-3xl shadow-inner backdrop-blur-md">
                {item.icon}
              </div>

              <div>
                <h3 className="text-xs md:text-lg font-medium uppercase tracking-[0.18em]">
                  {item.title}
                </h3>

                <p className="mt-1 md:mt-2 text-[9px] md:text-xs uppercase tracking-widest text-white/50">
                  View Products
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 h-px w-full scale-x-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover/type:scale-x-100" />

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover/type:translate-x-full" />

            <style>{`
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
            `}</style>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ShopByType;
