import React from "react";
import ShopByType from "./ShopByType";
import BrandScroller from "./BrandScroller";

const HorizentalScroll = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-0 md:py-0">
      <BrandScroller />
      <ShopByType />
    </div>
  );
};

export default HorizentalScroll;
