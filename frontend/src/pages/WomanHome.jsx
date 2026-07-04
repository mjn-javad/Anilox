import React from "react";
import BestSellersBanner from "../components/Banner/WomanBestSellersBanner";
import GlobalSlider from "../components/Slider/GlobalSlider";
import GlobalBanner from "../components/Banner/GlobalBanner";
import SecondWomanBanner from "../components/Banner/SecondWomanBanner";
import IntroduceBanner from "../components/Banner/IntroduceBanner";

import FirstBannerImg from "../assets/myBannerOunass/womanFirstBanner2.png";
import FourthBannerImg from "../assets/myBannerOunass/womanFourthBanner.png";
import ThirdBannerImg from "../assets/myBannerOunass/womanThirdBanner.PNG";
import HorizentalScroll from "../components/HorizentalScroll/HorizentalScroll";
import NewArivelsGlobalSlider from "../components/Slider/NewArivelsGlobalSlider";

const WomenHome = () => {
  return (
    <>
      <GlobalBanner sort_order={1} />
      <HorizentalScroll />

      {/* <SecondWomanBanner /> */}

      {/* <IntroduceBanner /> */}

      {/* <GlobalSlider
        myQuery={"?limit=4&type=watch&gender=female"}
        header={"Explore Women Watches"}
        title={"Discover luxury watches for women"}
        navigateLink={"/slider-shoes?type=watch&gender=female"}
        limit={4}
      />

      <GlobalBanner sort_order={1} /> */}

      <BestSellersBanner />

      {/* <GlobalSlider
        myQuery={"?limit=4&type=bag&gender=female"}
        header={"Explore Women Bags"}
        title={"Discover luxury bags for women"}
        navigateLink={"/slider-shoes?type=bag&gender=female"}
        limit={4}
      /> */}

      <GlobalBanner sort_order={5} />
      <div className="mt-4">
        <GlobalBanner sort_order={6} />
      </div>

      <NewArivelsGlobalSlider
        myQuery={"?limit=4&gender=female"}
        limit={20}
        header={"Big Sizes Availabe"}
      />
    </>
  );
};

export default WomenHome;
