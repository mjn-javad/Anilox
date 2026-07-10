import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ImgShoeMen from "../../assets/ShopByTypePic/Men/Shoes.png";
import ImgGlassMen from "../../assets/ShopByTypePic/Men/SunGlasses.png";
import ImgLuggMen from "../../assets/ShopByTypePic/Men/Luggages.png";
import ImgBagMen from "../../assets/ShopByTypePic/Men/Bags.png";

import ImgShoeWomen from "../../assets/ShopByTypePic/Women/Shoes.png";
import ImgGlassWomen from "../../assets/ShopByTypePic/Women/SunGlasses.png";
import ImgLuggWomen from "../../assets/ShopByTypePic/Women/Luggages.png";
import ImgBagWomen from "../../assets/ShopByTypePic/Women/Bags.png";

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

    if (genderParam) return genderParam.toLowerCase();

    const path = pathname.toLowerCase();

    if (path === "/men" || path.startsWith("/men/")) return "male";
    if (path === "/women" || path.startsWith("/women/")) return "female";

    return "female";
  }, [pathname, search]);

  const isMale = useMemo(() => {
    return gender === "male" || gender === "men";
  }, [gender]);

  const shopTypes = useMemo(() => {
    return [
      {
        title: "Shoes",
        type: "shoe",
        image: isMale ? ImgShoeMen : ImgShoeWomen,
      },
      {
        title: "Bags",
        type: "bag",
        image: isMale ? ImgBagMen : ImgBagWomen,
      },
      {
        title: "Glasses",
        type: "glasses",
        image: isMale ? ImgGlassMen : ImgGlassWomen,
      },
      {
        title: "Luggage",
        type: "luggage",
        image: isMale ? ImgLuggMen : ImgLuggWomen,
      },
    ];
  }, [isMale]);

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
        group/type relative appearance-none border-0 bg-transparent
        transition-transform duration-500 hover:-translate-y-1 active:scale-95
        ${activeTypeIndex === index ? "scale-[1.03]" : ""}
      `}
          >
            <div className="relative aspect-square w-full bg-transparent">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-contain bg-transparent transition-transform duration-700 group-hover/type:scale-105"
                draggable="false"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ShopByType;
