import React from "react";
import TopNavbar from "./TopNavBar";
import FirstBanner from "../Banner/FirstBanner";

const NavBar = ({ showBanner = false }) => {
  if (!showBanner) {
    // حالت بدون بنر - فقط TopNavbar به صورت عادی (نه absolute)
    return <TopNavbar />;
  }

  // حالت با بنر - TopNavbar روی بنر قرار می‌گیرد
  // return (
  //   <div className="relative w-full">
  //     <FirstBanner />
  //     {/* Navbar روی تصویر */}
  //     <div className="absolute top-0 left-0 w-full">
  //       <TopNavbar />
  //     </div>
  //   </div>
  // );
  return <TopNavbar />;
};

export default NavBar;
