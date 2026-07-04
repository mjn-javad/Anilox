import React from "react";
import {
  FaTruckFast,
  FaArrowsRotate,
  FaHeadset,
  FaMoneyBillWave,
  FaRulerCombined,
} from "react-icons/fa6";

const MiniTrustBar = () => {
  const items = [
    {
      icon: FaMoneyBillWave,
      label: "Cash on Delivery",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: FaArrowsRotate,
      label: "Free Size Exchange",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: FaRulerCombined,
      label: "Big Sizes Available up to 48",
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: FaHeadset,
      label: "24/7 Support",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: FaTruckFast,
      label: "Fast Delivery",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-white border-y border-gray-100 shadow-sm py-2 sm:py-3">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />

      <div className="trust-marquee flex w-max items-center gap-3 sm:gap-5 hover:[animation-play-state:paused]">
        {marqueeItems.map((item, index) => (
          <div
            key={index}
            className="
              flex items-center gap-2 rounded-full border border-gray-100
              bg-white px-3 py-1.5 sm:px-4 sm:py-2
              shadow-sm transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-md
            "
          >
            <div
              className={`
                ${item.bg}
                flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center
                rounded-full shrink-0
              `}
            >
              <item.icon className={`${item.color} text-xs sm:text-sm`} />
            </div>

            <span className="whitespace-nowrap text-[10px] sm:text-xs font-medium tracking-wide text-gray-700">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        .trust-marquee {
          animation: trustMarquee 24s linear infinite;
        }

        @keyframes trustMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
};

export default MiniTrustBar;
