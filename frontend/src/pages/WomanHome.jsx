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
      <FirstBanner gender={"female"} />
      <HorizentalScroll />

      <BestSellersBanner gender={"female"} />

      <GlobalBanner sort_order={5} />

      {/* <BigSizeGlobalSlider
        myQuery={"?limit=20&gender=female"}
        limit={20}
        header={"Big Sizes Available"}
      /> */}

      <GlobalSlider
        myQuery={"?type=watch&gender=female&limit=4"}
        header={"Woman Watches"}
        title={"See All"}
        navigateLink={"/slider-shoes?type=watch&gender=female"}
        limit={4}
      />
      <ProductFinderBox />
    </>
  );
};

export default WomenHome;
