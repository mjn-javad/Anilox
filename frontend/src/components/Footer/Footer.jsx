import React from "react";
import {
  FaMobileAlt,
  FaInstagram,
  FaWhatsapp,
  FaTelegramPlane,
  FaLocationArrow,
} from "react-icons/fa";

const FooterLinks = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Men",
    link: "/men",
  },
  {
    title: "Women",
    link: "/women",
  },
];

const socialLinks = [
  {
    title: "Instagram",
    link: "https://www.instagram.com/anilox.stop",
    icon: FaInstagram,
  },
  {
    title: "Telegram",
    link: "https://t.me/+Jll_oOOFeHAyYzBk",
    icon: FaTelegramPlane,
  },
  {
    title: "WhatsApp",
    link: "https://wa.me/971566425118",
    icon: FaWhatsapp,
  },
];

const Footer = () => {
  return (
    <footer className="w-full mt-auto relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Luxury glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 py-16 border-b border-white/10">
          {/* Company details */}
          <div className="space-y-5">
            <a
              href="/"
              className="inline-block text-primary font-extrabold tracking-[0.25em] text-3xl uppercase sm:text-4xl"
            >
              Anilox
            </a>

            <p className="text-gray-300 leading-7 lg:pr-16">
              Discover a premium shopping experience with elegant products,
              modern design, and luxurious style made for your everyday life.
            </p>

            <p className="text-gray-400 text-sm">
              Made with <span className="text-primary animate-pulse">💖</span>{" "}
              by{" "}
              <span className="text-white font-semibold">The MJ_Norouzi</span>
            </p>
          </div>

          {/* Footer content */}
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 md:pl-10">
            {/* Footer links */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <h1 className="text-xl font-bold mb-5 text-white">
                Important Links
              </h1>

              <ul className="space-y-4">
                {FooterLinks.map((data, index) => (
                  <li key={index}>
                    <a
                      href={data.link}
                      className="group inline-flex items-center gap-2 text-gray-300 hover:text-primary duration-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-60 group-hover:scale-150 transition-transform duration-300"></span>
                      {data.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Address */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
              <h1 className="text-xl font-bold mb-5 text-white">Address</h1>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 flex items-center justify-center rounded-full bg-primary/15 text-primary">
                    <FaLocationArrow />
                  </span>
                  <p className="text-gray-300">UAE</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 flex items-center justify-center rounded-full bg-primary/15 text-primary">
                    <FaMobileAlt />
                  </span>
                  <a
                    href="https://wa.me/971566425118"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-primary transition-colors"
                  >
                    +971 566425118
                  </a>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-4 pt-3">
                  {socialLinks.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.title}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-gray-300 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
                      >
                        <Icon className="text-xl" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Anilox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
