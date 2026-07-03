import React from "react";
import { FaMobileAlt } from "react-icons/fa";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationArrow,
} from "react-icons/fa6";

const FooterLinks = [
  {
    title: "Home",
    link: "/",
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
              href="#"
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
                  <p className="text-gray-300">UAE, Sharjah</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 flex items-center justify-center rounded-full bg-primary/15 text-primary">
                    <FaMobileAlt />
                  </span>
                  <p className="text-gray-300">+971 566425118</p>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-4 pt-3">
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-gray-300 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
                  >
                    <FaInstagram className="text-xl" />
                  </a>

                  <a
                    href="#"
                    aria-label="Facebook"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-gray-300 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
                  >
                    <FaFacebook className="text-xl" />
                  </a>

                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-gray-300 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
                  >
                    <FaLinkedin className="text-xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Anilox. All rights reserved.</p>

          {/* <div className="flex items-center gap-6">
            <a href="/#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/#" className="hover:text-primary transition-colors">
              Terms
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
