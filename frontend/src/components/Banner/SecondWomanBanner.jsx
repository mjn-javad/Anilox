import React from "react";
import { Link } from "react-router-dom";

import myImage1 from "../../assets/myBannerOunass/womanSecondBannerShoes.webp";
import myImage2 from "../../assets/myBannerOunass/womanSecondBannerBags.webp";
import myImage3 from "../../assets/myBannerOunass/womanSecondBannerSunGlasses.webp";

const SecondWomanBanner = () => {
  const images = [
    {
      id: 1,
      src: myImage1,
      alt: "Woman Shoes Banner",
      title: "Shoes",
      link: "/slider-shoes?type=shoe&gender=female",
    },
    {
      id: 2,
      src: myImage2,
      alt: "Woman Bags Banner",
      title: "Bags",
      link: "/slider-shoes?type=bag&gender=female",
    },
    {
      id: 3,
      src: myImage3,
      alt: "Woman Sunglasses Banner",
      title: "Sunglasses",
      link: "/slider-shoes?type=glasses&gender=female",
    },
  ];

  return (
    <div className="container mx-auto px-0 py-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {images.map((image) => (
          <Link key={image.id} to={image.link}>
            <div className="relative cursor-pointer min-w-0 overflow-hidden group">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-[250px] sm:h-[350px] md:h-[400px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Soft luxury gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent"></div>

              {/* Left text */}
              <div className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2">
                <h3 className="text-white text-lg sm:text-2xl md:text-3xl font-light tracking-[0.2em] uppercase drop-shadow-xl">
                  {image.title}
                </h3>

                <div className="mt-3 w-10 sm:w-14 h-[1px] bg-white/90 drop-shadow-lg"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SecondWomanBanner;
