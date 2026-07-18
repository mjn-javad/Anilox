import React, { useEffect, useState } from "react";
import apiClientBrandPopular from "../../services/api-client";
import apiClientBanner from "../../services/api-client_banner";
import ProductCard from "./ProductCart";

const NewArivelsGlobalSlider = ({
  myQuery = "",
  header,
  title,
  navigateLink,
  limit,
}) => {
  const [shoes, setShoes] = useState([]);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState("");
  const BigSizeBannerStOrd = 11;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        const [shoesRes, bannerRes] = await Promise.all([
          apiClientBrandPopular.get(`/newArrivels${myQuery}`),
          apiClientBanner.get(`/${BigSizeBannerStOrd}`),
        ]);

        setShoes(shoesRes.data?.data || []);

        const bannerResult = bannerRes.data?.data || bannerRes.data;

        setBanner(
          Array.isArray(bannerResult)
            ? bannerResult[0] || null
            : bannerResult || null,
        );
      } catch (err) {
        console.error("New arrivals error:", err);
        setError("Failed to load new arrivals");
      }
    };

    fetchData();
  }, [myQuery]);

  return (
    <div className="container">
      {error && (
        <p className="my-4 text-center text-sm text-red-500">{error}</p>
      )}

      {banner?.image && (
        <div className="mb-0 hidden overflow-hidden rounded-2xl lg:block">
          <img
            src={`/api/images/banners/${banner.image}`}
            alt={banner.title || "New arrivals banner"}
            className="block aspect-[16/5] w-full object-cover"
          />
        </div>
      )}

      <ProductCard
        shoes={shoes}
        header={header}
        title={title}
        navigateLink={navigateLink}
        scrollOnMobile={limit !== undefined}
        apiUrl={`/api/v1/brandPopular/newArrivels${myQuery}`}
        limit={limit}
        infiniteScroll={false}
      />
    </div>
  );
};

export default NewArivelsGlobalSlider;
