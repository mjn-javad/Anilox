import React from "react";
import GlobalBanner from "../components/Banner/GlobalBanner";
import GlobalSlider from "../components/Slider/GlobalSlider";
import BestSellersBanner from "../components/Banner/BestSellersBanner";
import IntroduceBanner from "../components/Banner/IntroduceBanner";

// فعلاً عکس‌ها را با عکس‌های خودت جایگزین کن
import MenFirstBannerImg from "../assets/myBannerOunass/menFirstBanner.PNG";
import MenThirdBannerImg from "../assets/myBannerOunass/manThirdBannerShoes.PNG";
import SecondManBanner from "../components/Banner/SecondManBanner";
import FourthBannerImg from "../assets/myBannerOunass/womanFourthBanner.png";

const MenHome = () => {
  return (
    <>
      <GlobalBanner
        image={MenFirstBannerImg}
        title="Men-sale"
        subtitle="Exclusive Women's Collection | Limited-Time Deals"
        link="/slider-shoes?gender=male&discountOnly=true"
      />

      <SecondManBanner />

      {/* <IntroduceBanner /> */}

      <GlobalSlider
        myQuery={"?limit=4&type=shoe&gender=male"}
        header={"Explore Men Shoes"}
        title={"Discover luxury shoes for men"}
        navigateLink={"/slider-shoes?type=shoe&gender=male"}
        limit={4}
      />

      <GlobalBanner
        image={MenThirdBannerImg}
        title="Men-Sneakers"
        subtitle="Lightweight. Flexible. Built for Motion."
        link="/slider-shoes?type=shoe&gender=male&category=sneaker"
      />

      <BestSellersBanner />

      <GlobalSlider
        myQuery={"?limit=4&type=watch"}
        header={"Explore Men Watches"}
        title={"Discover luxury watches for men"}
        navigateLink={"/slider-shoes?type=watch&gender=male"}
        limit={4}
      />
      <GlobalBanner
        image={FourthBannerImg}
        title="Luggages for Vacation"
        subtitle="Travel This Summer"
        link="/slider-shoes?type=luggage"
      />
      <GlobalSlider
        myQuery={"?limit=4&type=bag&gender=male"}
        header={"Explore Men Bags"}
        title={"Discover luxury bags for men"}
        navigateLink={"/slider-shoes?type=bag&gender=male"}
        limit={4}
      />
    </>
  );
};

export default MenHome;
