import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Woman from "../assets/LandingPage/women.webp";
import Man from "../assets/LandingPage/men.webp";

const items = [
  { gender: "women", image: Woman },
  { gender: "men", image: Man },
];

function GenderLanding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleClick = (gender) => {
    if (selected) return;

    setSelected(gender);

    setTimeout(() => {
      navigate(`/${gender}`);
    }, 450);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden md:flex-row">
      {items.map(({ gender, image }) => (
        <button
          key={gender}
          type="button"
          onClick={() => handleClick(gender)}
          className={`
            relative min-h-0 flex-1 overflow-hidden
            transition-all duration-500 ease-out
            ${
              selected === gender
                ? "z-10 scale-[1.015]"
                : selected
                  ? "scale-[0.985] opacity-60"
                  : ""
            }
          `}
        >
          <img
            src={image}
            alt={gender === "women" ? "Women" : "Men"}
            className={`
              h-full w-full object-contain
              transition-transform duration-700 ease-out
              ${selected === gender ? "scale-[1.025]" : "hover:scale-[1.015]"}
            `}
          />

          <span
            className={`
              pointer-events-none absolute inset-0
              transition-all duration-500
              ${
                selected === gender
                  ? "bg-[#d4af37]/10 ring-2 ring-inset ring-[#d4af37]/70"
                  : "bg-transparent"
              }
            `}
          />
        </button>
      ))}
    </div>
  );
}

export default GenderLanding;
