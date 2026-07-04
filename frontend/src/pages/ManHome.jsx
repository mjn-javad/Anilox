import React from "react";
import GlobalBanner from "../components/Banner/GlobalBanner";
import GlobalSlider from "../components/Slider/GlobalSlider";
import BestSellersBanner from "../components/Banner/WomanBestSellersBanner";
import IntroduceBanner from "../components/Banner/IntroduceBanner";

// فعلاً عکس‌ها را با عکس‌های خودت جایگزین کن
import MenFirstBannerImg from "../assets/myBannerOunass/menFirstBanner.PNG";
import MenThirdBannerImg from "../assets/myBannerOunass/manThirdBannerShoes.PNG";
import FourthBannerImg from "../assets/myBannerOunass/womanFourthBanner.png";
import HorizentalScroll from "../components/HorizentalScroll/HorizentalScroll";
import NewArivelsGlobalSlider from "../components/Slider/NewArivelsGlobalSlider";

const MenHome = () => {
  return (
    <>
      <GlobalBanner sort_order={7} />
      <HorizentalScroll />

      {/* <SecondManBanner /> */}

      {/* <IntroduceBanner /> */}

      {/* <GlobalSlider
        myQuery={"?limit=4&type=shoe&gender=male"}
        header={"Explore Men Shoes"}
        title={"Discover luxury shoes for men"}
        navigateLink={"/slider-shoes?type=shoe&gender=male"}
        limit={4}
      /> */}

      {/* <GlobalBanner
        image={MenThirdBannerImg}
        title="Men-Sneakers"
        subtitle="Lightweight. Flexible. Built for Motion."
        link="/slider-shoes?type=shoe&gender=male&category=sneaker"
      /> */}

      <BestSellersBanner />

      {/* <GlobalSlider
        myQuery={"?limit=4&type=watch"}
        header={"Explore Men Watches"}
        title={"Discover luxury watches for men"}
        navigateLink={"/slider-shoes?type=watch&gender=male"}
        limit={4}
      /> */}

      <GlobalBanner sort_order={5} />

      <div className="mt-4">
        <GlobalBanner sort_order={11} />
      </div>

      <NewArivelsGlobalSlider
        myQuery={"?limit=4&gender=male"}
        limit={20}
        header={"Big Sizes Availabe"}
      />
      {/* <GlobalSlider
        myQuery={"?limit=4&type=bag&gender=male"}
        header={"Explore Men Bags"}
        title={"Discover luxury bags for men"}
        navigateLink={"/slider-shoes?type=bag&gender=male"}
        limit={4}
      /> */}
    </>
  );
};

export default MenHome;
