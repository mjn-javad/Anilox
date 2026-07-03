import React from "react";
import {
  FaTruckFast,
  FaArrowsRotate,
  FaHeadset,
  FaMoneyBillWave,
} from "react-icons/fa6";

const MiniTrustBar = () => {
  const items = [
    { icon: FaMoneyBillWave, label: "پرداخت درب منزل" },
    { icon: FaArrowsRotate, label: "تعویض سایز" },
    { icon: FaHeadset, label: "پشتیبانی ۲۴ ساعته" },
    { icon: FaTruckFast, label: "ارسال سریع" },
  ];

  return (
    <div className="bg-gray-50 border-y border-gray-200 py-2 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4 md:gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-gray-700">
            <item.icon className="text-sm text-gray-500" />
            <span>{item.label}</span>
            {idx < items.length - 1 && (
              <span className="hidden sm:inline text-gray-300 mx-1">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniTrustBar;
