import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const BannerVertical = ({ gende = "female" }) => {
  const navigate = useNavigate();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  const bannerSortOrder = 1;

  useEffect(() => {
    let isMounted = true;

    apiClientBanner
      .get(`/${bannerSortOrder}`)
      .then((res) => {
        const result = res.data?.data || res.data;
        const loadedBanner = Array.isArray(result) ? result[0] : result;

        if (isMounted) {
          setBanner(loadedBanner || null);
        }
      })
      .catch((err) => {
        console.log("BannerVertical Error:", err);

        if (isMounted) {
          setBanner(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 py-12">
        <div className="mx-auto h-[520px] w-full max-w-sm rounded-2xl bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (!banner) return null;

  const imageUrl = banner.image?.startsWith("http")
    ? banner.image
    : `http://localhost:4000/images/banners/${banner.image}`;

  return (
    <section className="w-full px-4 py-12">
      <div
        onClick={() => navigate(`/bestSellers?gender=${gender}`)}
        className="group relative mx-auto h-[520px] w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl shadow-lg"
      >
        <img
          src={imageUrl}
          alt="Best Sellers"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            Top Picks
          </p>

          <h2 className="mt-2 font-serif text-4xl font-light">Best Sellers</h2>

          <p className="mt-3 text-sm text-white/80">Our most loved items</p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[#d8b46a]">
            <span>Shop Now</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-[#d8b46a] transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </section>
  );
};

export default BannerVertical;
