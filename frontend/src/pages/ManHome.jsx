import React from "react";
import BestSellersBanner from "../components/Banner/BestSellersBanner";
import GlobalSlider from "../components/Slider/GlobalSlider";
import GlobalBanner from "../components/Banner/GlobalBanner";
import HorizentalScroll from "../components/HorizentalScroll/HorizentalScroll";
import BigSizeGlobalSlider from "../components/Slider/BigSizeGlobalSlider";
import ProductFinderBox from "../components/OrderOnWhatsApp/ProductFinderBox";
import FirstBanner from "../components/Banner/FirstBanner";

const WomenHome = () => {
  return (
    <>
      <FirstBanner gender={"male"} />
      <HorizentalScroll />

      <BestSellersBanner gender={"male"} />

      <GlobalBanner sort_order={6} />

      <BigSizeGlobalSlider
        myQuery={"?limit=20&gender=male"}
        limit={20}
        header={"Big Sizes Available"}
      />
      <ProductFinderBox />
    </>
  );
};

export default WomenHome;
