import React from "react";
import myImage from "../../assets/myBannerOunass/Introducing.jpg";

const IntroduceBanner = () => {
  return (
    <div className="container">
      <div className="min-w-full relative">
        <img src={myImage} className="w-full" />
      </div>
    </div>
  );
};

export default IntroduceBanner;
