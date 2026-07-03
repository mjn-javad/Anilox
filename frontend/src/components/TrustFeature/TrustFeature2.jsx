import React from "react";
import {
  FaTruckFast,
  FaArrowsRotate,
  FaHeadset,
  FaMoneyBillWave,
} from "react-icons/fa6";

const PremiumTrustBadges = () => {
  const features = [
    {
      id: 1,
      title: "Fast Delivery",
      subtitle: "To your doorstep",
      icon: FaTruckFast,
    },
    {
      id: 2,
      title: "Easy Returns",
      subtitle: "Size exchange within 7 days",
      icon: FaArrowsRotate,
    },
    {
      id: 3,
      title: "24/7 Support",
      subtitle: "Real human assistance",
      icon: FaHeadset,
    },
    {
      id: 4,
      title: "Pay on Delivery",
      subtitle: "Cash or card at your door",
      icon: FaMoneyBillWave,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header - مینیمال */}
      <div className="text-center mb-8">
        <span className="text-[#b8915a] text-xs tracking-[0.2em] uppercase">
          Premium Service
        </span>
        <h2 className="text-2xl md:text-3xl font-light text-gray-900 mt-1">
          Why Choose Us
        </h2>
        <div className="w-8 h-0.5 bg-[#b8915a] mx-auto mt-3"></div>
      </div>

      {/* Features - ۴ ستون در همه سایزها */}
      <div className="grid grid-cols-4 gap-3 md:gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="group text-center p-3 md:p-6 border border-gray-100 hover:border-[#b8915a] transition-all duration-300 bg-white"
          >
            {/* Icon - کوچکتر */}
            <div className="flex justify-center mb-2 md:mb-4">
              <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-[#b8915a] group-hover:bg-[#b8915a] group-hover:text-white transition-all duration-300 border border-[#b8915a] text-sm md:text-2xl">
                <feature.icon className="text-lg md:text-2xl" />
              </div>
            </div>

            {/* Text - کوچکتر در موبایل */}
            <h3 className="text-[10px] md:text-base font-medium text-gray-800 tracking-wide">
              {feature.title}
            </h3>
            <p className="text-[8px] md:text-xs text-gray-400 mt-0.5 md:mt-1.5 tracking-wide">
              {feature.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumTrustBadges;
