import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const OrderOnWhatsApp = ({
  productName = "",
  productPrice = "",
  productId = "",
  phoneNumber = "971566425118",
}) => {
  const [currentUrl, setCurrentUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    // تشخیص موبایل
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOrder = () => {
    let message = `Hello! I would like to buy this product:`;
    if (productName) message += `\n\nProduct: ${productName}`;
    if (productPrice) message += `\nPrice: ${productPrice}`;
    if (productId) message += `\nProduct ID: ${productId}`;
    message += `\n\nLink: ${currentUrl}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank",
    );
  };

  return (
    <button
      onClick={handleOrder}
      className={`
        fixed bottom-6 right-6 z-50 
        bg-green-500 hover:bg-green-600 
        text-white p-4 rounded-full 
        shadow-2xl hover:shadow-3xl 
        transition-all duration-300 
        hover:scale-110 active:scale-95 
        flex items-center justify-center gap-2 
        group
        ${isMobile ? "pr-2" : ""}
      `}
      aria-label="Order on WhatsApp"
    >
      <FaWhatsapp size={28} className="flex-shrink-0" />

      {/* دسکتاپ: نمایش با hover */}
      <span
        className={`
        overflow-hidden whitespace-nowrap 
        transition-all duration-300 
        ${isMobile ? "max-w-xs ml-1" : "max-w-0 group-hover:max-w-xs"}
      `}
      >
        Order on WhatsApp
      </span>

      <Send size={18} className="flex-shrink-0 opacity-70" />
    </button>
  );
};

export default OrderOnWhatsApp;
