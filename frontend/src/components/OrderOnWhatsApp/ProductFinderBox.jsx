import React from "react";
import { FaWhatsapp } from "react-icons/fa6";

import finderImage from "../../assets/ProductFinderBox/finderBox3.jpg";

const ProductFinderBox = () => {
  const phoneNumber = "971566425118";

  const message =
    "Hi, I’m looking for a product. I will send you the name or photo. Please help me find it and let me know the price.";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <section className="w-full px-4 py-8">
      <div className="relative mx-auto w-full max-w-[950px] overflow-hidden rounded-2xl">
        <img
          src={finderImage}
          alt="Anilox personal luxury product finder service"
          className="block h-auto w-full object-contain"
        />

        <div className="absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 sm:bottom-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send a product photo on WhatsApp"
            className="group relative block whitespace-nowrap rounded-full bg-gradient-to-r from-[#755014] via-[#f4d77d] to-[#755014] p-px shadow-[0_5px_16px_rgba(123,83,21,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(169,119,31,0.42)] sm:p-[1.5px]"
          >
            <span className="relative flex items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#e6c56f]/40 bg-gradient-to-b from-[#181818]/95 to-[#050505]/95 px-2.5 py-1.5 text-[8px] font-semibold tracking-[0.06em] text-[#efd486] backdrop-blur-md transition-all duration-500 group-hover:border-[#f4da8f]/70 group-hover:text-[#ffe8a8] sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[12px] sm:tracking-[0.11em]">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <span className="absolute -left-20 top-0 h-full w-10 rotate-12 bg-white/20 blur-md transition-all duration-700 group-hover:left-[115%]" />

              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d8b457]/70 bg-black/70 shadow-[inset_0_0_8px_rgba(238,202,112,0.16)] sm:h-8 sm:w-8">
                <FaWhatsapp className="text-[11px] text-[#efd486] transition-all duration-300 group-hover:scale-110 group-hover:text-[#ffe8a8] sm:text-base" />
              </span>

              <span className="relative">SEND A PHOTO ON WHATSAPP</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductFinderBox;
