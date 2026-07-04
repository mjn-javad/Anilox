import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const BannerVertical = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const sortOrders = [2, 3, 4];

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    Promise.all(
      sortOrders.map((sort_order) => apiClientBanner.get(`/${sort_order}`)),
    )
      .then((responses) => {
        const loadedBanners = responses
          .map((res, index) => {
            const result = res.data?.data || res.data;

            // اگر بک‌اند آرایه برگرداند، اولین بنر را بردار
            const banner = Array.isArray(result) ? result[0] : result;

            if (!banner) return null;

            return {
              id: banner.id || index + 1,
              sort_order: sortOrders[index],
              image: banner.image,
              title: banner.title1,
              link: banner.title2 || "/",
            };
          })
          .filter(Boolean);

        if (isMounted) {
          setBanners(loadedBanners);
        }
      })
      .catch((err) => {
        console.log("BannerVertical Error:", err);

        if (isMounted) {
          setBanners([]);
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900 mt-2">
            Most Popular
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
            Discover the most loved products by our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="w-full aspect-[4/5] bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900 mt-2">
          Most Popular
        </h2>

        <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
          Discover the most loved products by our community
        </p>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {banners.map((banner) => {
          const imageUrl = banner.image?.startsWith("http")
            ? banner.image
            : `/api/images/banners/${banner.image}`;

          return (
            <div
              key={banner.id}
              className="group relative cursor-pointer overflow-hidden"
              onClick={() => navigate(banner.link)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={imageUrl}
                  alt={banner.title}
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-light mt-1">
                    {banner.title}
                  </h3>

                  <div className="mt-4 text-sm text-white/70 hover:text-[#b8915a] transition-colors duration-300 flex items-center gap-2 group/btn">
                    <span>Explore</span>
                    <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">
                      →
                    </span>
                  </div>
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b8915a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerVertical;
