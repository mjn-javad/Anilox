import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function GenderLanding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleClick = (gender) => {
    setSelected(gender);

    setTimeout(() => {
      navigate(`/${gender}`);
    }, 500);
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-black p-3 sm:p-5">
      <div className="flex h-full w-full flex-col gap-1 md:flex-row">
        {/* WOMEN */}
        <div
          onClick={() => handleClick("women")}
          className={`
            relative flex min-h-0 cursor-pointer items-center
            justify-center overflow-hidden
            border border-[#b89b55]
            bg-[#11110f]
            transition-all duration-500 ease-in-out

            ${
              selected === "women"
                ? "flex-[1.5] md:flex-[1.5] scale-[1.01] z-10"
                : selected === "men"
                  ? "flex-[0.5]"
                  : "flex-1"
            }
          `}
        >
          {/* Inner Border */}
          <div className="absolute inset-3 sm:inset-4 border border-[#b89b55]" />

          <div className="relative z-10 text-center">
            <h1
              className="
                font-serif
                text-[clamp(3.2rem,14vw,8.7rem)]
                leading-none
                tracking-[-0.06em]
                text-[#e9c66a]
              "
            >
              WOMEN
            </h1>

            <div
              className="
                mt-5 sm:mt-8
                flex items-center justify-center gap-4
                text-[10px] sm:text-xs
                tracking-[0.3em]
                text-[#e9c66a]
              "
            >
              <span>SHOP NOW</span>

              <span className="text-2xl sm:text-3xl tracking-normal">→</span>
            </div>
          </div>
        </div>

        {/* MEN */}
        <div
          onClick={() => handleClick("men")}
          className={`
            relative flex min-h-0 cursor-pointer items-center
            justify-center overflow-hidden
            border border-[#b89b55]
            bg-[#f7f3ed]
            transition-all duration-500 ease-in-out

            ${
              selected === "men"
                ? "flex-[1.5] md:flex-[1.5] scale-[1.01] z-10"
                : selected === "women"
                  ? "flex-[0.5]"
                  : "flex-1"
            }
          `}
        >
          {/* Inner Border */}
          <div className="absolute inset-3 sm:inset-4 border border-[#b89b55]" />

          <div className="relative z-10 text-center">
            <h1
              className="
                font-serif
                text-[clamp(4rem,16vw,10rem)]
                leading-none
                tracking-[-0.06em]
                text-[#151515]
              "
            >
              MEN
            </h1>

            <div
              className="
                mt-5 sm:mt-8
                flex items-center justify-center gap-4
                text-[10px] sm:text-xs
                tracking-[0.3em]
                text-[#b89b55]
              "
            >
              <span>SHOP NOW</span>

              <span className="text-2xl sm:text-3xl tracking-normal">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenderLanding;
