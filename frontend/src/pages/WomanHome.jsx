import React from "react";
import BestSellersBanner from "../components/Banner/BestSellersBanner";
import GlobalSlider from "../components/Slider/GlobalSlider";
import GlobalBanner from "../components/Banner/GlobalBanner";
import SecondWomanBanner from "../components/Banner/SecondWomanBanner";
import IntroduceBanner from "../components/Banner/IntroduceBanner";

import FirstBannerImg from "../assets/myBannerOunass/womanFirstBanner2.png";
import FourthBannerImg from "../assets/myBannerOunass/womanFourthBanner.png";
import ThirdBannerImg from "../assets/myBannerOunass/womanThirdBanner.PNG";

const WomenHome = () => {
  return (
    <>
      <GlobalBanner
        image={FirstBannerImg}
        title="Women-sale"
        subtitle="Exclusive Women's Collection | Limited-Time Deals"
        link="/slider-shoes?gender=female&discountOnly=true"
      />

      <SecondWomanBanner />

      {/* <IntroduceBanner /> */}

      <GlobalSlider
        myQuery={"?limit=4&type=watch&gender=female"}
        header={"Explore Women Watches"}
        title={"Discover luxury watches for women"}
        navigateLink={"/slider-shoes?type=watch&gender=female"}
      />

      <GlobalBanner
        image={ThirdBannerImg}
        title="Woman - Heels"
        subtitle="Walk with Power"
        link="/slider-shoes?type=shoe&gender=female&category=heels"
      />

      <BestSellersBanner />

      <GlobalSlider
        myQuery={"?limit=4&type=bag&gender=female"}
        header={"Explore Women Bags"}
        title={"Discover luxury bags for women"}
        navigateLink={"/slider-shoes?type=bag&gender=female"}
      />

      <GlobalBanner
        image={FourthBannerImg}
        title="Luggages for Vacation"
        subtitle="Travel This Summer"
        link="/slider-shoes?type=luggage"
      />
    </>
  );
};

export default WomenHome;
