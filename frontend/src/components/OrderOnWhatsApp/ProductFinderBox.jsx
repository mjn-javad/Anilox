import React from "react";
import { Send } from "lucide-react";

const ProductFinderBox = () => {
  const phoneNumber = "989384835369";

  const message =
    "Hi, I’m looking for a product. I will send you the name or photo. Please help me find it and let me know the price.";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <section className="w-full px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-5 shadow-sm md:flex-row md:px-7">
        <div className="text-center md:text-left">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-400">
            Personal Shopping
          </p>

          <h2 className="text-lg font-light tracking-wide text-neutral-900 md:text-xl">
            Can’t Find What You’re Looking For?
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Send us the product name or photo on WhatsApp. We’ll find it and
            share the price with you.
          </p>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-black hover:shadow-md"
        >
          <Send size={15} />
          WhatsApp
        </a>
      </div>
    </section>
  );
};

export default ProductFinderBox;
