import React from "react";
import {
  ArrowRight,
  Camera,
  Gift,
  Search,
  Smartphone,
  Tag,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const ProductFinderBox = () => {
  const phoneNumber = "971566425118";

  const message =
    "Hi, I’m looking for a product. I will send you the name or photo. Please help me find it and let me know the price.";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  const steps = [
    { icon: <Smartphone size={18} />, extra: <Camera size={10} /> },
    { icon: <Search size={20} /> },
    { icon: <Tag size={20} /> },
  ];

  return (
    <section className="w-full px-4 py-4">
      <div className="mx-auto max-w-xl rounded-[20px] border border-[#d2a12c] bg-white px-4 py-5 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
        <div className="mb-3 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5efe2] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#285539]">
            <Gift size={14} className="text-[#c99a2e]" />
            Free Service
          </div>
        </div>

        <div className="text-center">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.32em] text-[#285539]">
            Personal Shopping
          </p>

          <h2 className="font-serif text-xl font-semibold leading-tight text-[#285539] sm:text-2xl md:text-3xl">
            Can’t find it?
          </h2>

          <h3 className="mt-0.5 font-serif text-xl font-semibold leading-tight text-[#b78313] sm:text-2xl md:text-3xl">
            We’ll source it for you
          </h3>
        </div>

        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2">
          {steps.map((item, index) => (
            <React.Fragment key={index}>
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#285539] shadow-sm ring-1 ring-[#efe4cc] sm:h-11 sm:w-11">
                {item.icon}

                {item.extra && (
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {item.extra}
                  </span>
                )}
              </div>

              {index !== steps.length - 1 && (
                <div className="h-px w-5 border-t-2 border-dotted border-[#d9b85c] sm:w-8" />
              )}
            </React.Fragment>
          ))}
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mx-auto mt-5 flex h-11 w-[270px] max-w-full items-center justify-between
            rounded-full bg-gradient-to-r from-[#285539] to-[#1d2f16]
            px-4 text-white shadow-[0_8px_20px_rgba(40,85,57,0.25)]
            transition-all duration-300 hover:-translate-y-0.5
            hover:shadow-[0_12px_26px_rgba(40,85,57,0.32)]
            active:scale-95 sm:w-[320px]
          "
        >
          <div className="flex items-center gap-2.5">
            <FaWhatsapp className="text-2xl text-[#d9b85c]" />

            <span className="h-5 w-px bg-[#d9b85c]/50" />

            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:text-[10px]">
              Send Photo On WhatsApp
            </span>
          </div>

          <ArrowRight size={17} className="text-[#d9b85c]" />
        </a>
      </div>
    </section>
  );
};

export default ProductFinderBox;
