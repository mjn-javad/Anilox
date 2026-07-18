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

      <BigSizeGlobalSlider
        myQuery={"?limit=20&gender=male"}
        limit={20}
        header={"Big Sizes Available"}
      />

      <GlobalSlider
        myQuery={"?type=watch&gender=male&limit=20"}
        header={"Man Watches"}
        title={"Sell All"}
        navigateLink={"/slider-shoes?type=watch&gender=male"}
        limit={20}
        infiniteScroll={false}
        scrollOnMobile={true}
        scrollOnLaptop={true}
      />

      <GlobalBanner mobileSortOrder={9} laptopSortOrder={10} />

      <ProductFinderBox />
    </>
  );
};

export default WomenHome;
