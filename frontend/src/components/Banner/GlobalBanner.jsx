import React from "react";
import { Link } from "react-router-dom";

const GlobalBanner = ({ image, title, subtitle, link }) => {
  return (
    <div className="container mx-auto">
      <Link to={link}>
        <div className="min-w-full relative overflow-hidden group cursor-pointer">
          <img
            src={image}
            alt={title}
            className="w-full h-[400px] sm:h-[500px] md:h-[660px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Very soft gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent"></div>

          {/* Text */}
          <div className="absolute left-6 sm:left-10 md:left-16 top-1/2 -translate-y-1/2">
            <p className="text-white text-xs sm:text-sm md:text-base font-light tracking-[0.35em] uppercase mb-3 drop-shadow-lg">
              {subtitle}
            </p>

            <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.18em] uppercase drop-shadow-xl">
              {title}
            </h1>

            <div className="mt-5 w-14 sm:w-20 h-[1px] bg-white/90 drop-shadow-lg"></div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GlobalBanner;
