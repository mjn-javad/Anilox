import React from "react";

import finderImage from "../../assets/ProductFinderBox/ProductFinderBox.jpg";

const ProductFinderBox = () => {
  const phoneNumber = "971566425118";

  const message =
    "Hi, I’m looking for a product. I will send you the name or photo. Please help me find it and let me know the price.";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <section className="w-full flex justify-center px-4 py-6">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-[460px] overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      >
        <img
          src={finderImage}
          alt="Send a photo on WhatsApp"
          className="w-full h-auto object-contain"
        />
      </a>
    </section>
  );
};

export default ProductFinderBox;
