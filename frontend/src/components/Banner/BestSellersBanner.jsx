import React from "react";
import { useNavigate } from "react-router-dom";
import Suggest1 from "../../assets/Suggest1.jpg";
import Suggest2 from "../../assets/BestsellerPic/Rimowa.PNG";
import Suggest3 from "../../assets/BestsellerPic/HermesBag.png";

const BannerVertical = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      image: Suggest1,
      title: "Nike Air Max",
      subtitle: "Iconic Style",
      link: "/product/nike-air-max",
    },
    {
      id: 2,
      image: Suggest2,
      title: "Rimowa",
      subtitle: "Ready For Summer",
      link: "/shoe/327",
    },
    {
      id: 3,
      image: Suggest3,
      title: "Hermes",
      subtitle:
        "Birkin 20 Faubourg White Matte Alligator with Palladium Hardware",
      link: "/shoe/375",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        {/* <span className="text-sm text-[#b8915a] tracking-[0.3em] uppercase font-medium">
          Best Sellers
        </span> */}
        <h2 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900 mt-2">
          Most Popular
        </h2>
        <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
          Discover the most loved products by our community
        </p>
      </div>

      {/* Products - متن روی عکس */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="group relative cursor-pointer overflow-hidden"
            onClick={() => navigate(product.link)}
          >
            {/* عکس */}
            <div className="relative overflow-hidden bg-gray-50">
              <img
                src={product.image}
                alt={product.title}
                className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* اوورلی تیره برای خوانایی بهتر متن */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>

              {/* متن روی عکس - پایین */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <p className="text-xs text-[#b8915a] tracking-widest uppercase font-medium">
                  {product.subtitle}
                </p>
                <h3 className="text-2xl md:text-3xl font-light mt-1">
                  {product.title}
                </h3>

                {/* لینک Explore */}
                <div className="mt-4 text-sm text-white/70 hover:text-[#b8915a] transition-colors duration-300 flex items-center gap-2 group/btn">
                  <span>Explore</span>
                  <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">
                    →
                  </span>
                </div>
              </div>

              {/* خط نازک پایین عکس در هاور */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b8915a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerVertical;
