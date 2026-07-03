import React from "react";
import {
  FaTruckFast,
  FaArrowsRotate,
  FaHeadset,
  FaMoneyBillWave,
} from "react-icons/fa6";

const MiniTrustBar = () => {
  const size = {
    barPadding: "py-2 sm:py-3 px-2 sm:px-4",
    itemGap: "gap-1 sm:gap-2",
    iconBox: "p-1 sm:p-1.5",
    iconSize: "text-[10px] sm:text-sm",
    textSize: "text-[7px] sm:text-xs",
  };

  const items = [
    {
      icon: FaMoneyBillWave,
      label: "Cash on Delivery",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      icon: FaArrowsRotate,
      label: "Free Size Exchange",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: FaHeadset,
      label: "24/7 Support",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: FaTruckFast,
      label: "Fast Delivery",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div
      className={`bg-white border-y border-gray-100 shadow-sm ${size.barPadding}`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-4 items-center">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`
              group flex items-center justify-center ${size.itemGap}
              text-gray-700 cursor-default min-w-0
              transition-transform duration-200 hover:scale-105
              ${idx < items.length - 1 ? "border-r border-gray-100" : ""}
            `}
          >
            <div
              className={`
                ${item.bgColor}
                ${size.iconBox}
                rounded-full transition-all duration-200 group-hover:shadow-md
                shrink-0
              `}
            >
              <item.icon className={`${size.iconSize} ${item.color}`} />
            </div>

            <span
              className={`
                ${size.textSize}
                font-medium text-gray-700 group-hover:text-gray-900
                whitespace-nowrap truncate min-w-0
              `}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniTrustBar;
