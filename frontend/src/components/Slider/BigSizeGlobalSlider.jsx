import React, { useEffect, useState } from "react";
import apiClientBrandPopular from "../../services/api-client";
import apiClientBanner from "../../services/api-client_banner";
import ProductCard from "./ProductCart";

const IMAGE_BASE_URL = "/api/images/banners/";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${IMAGE_BASE_URL}${image}`;
};

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
    let isMounted = true;

    const fetchShoes = async () => {
      try {
        const shoesRes = await apiClientBrandPopular.get(
          `/newArrivels${myQuery}`,
        );

        if (isMounted) {
          setShoes(shoesRes.data?.data || []);
        }
      } catch (err) {
        console.error("New arrivals request error:", err);

        if (isMounted) {
          setShoes([]);
          setError("Failed to load new arrivals");
        }
      }
    };

    const fetchBanner = async () => {
      try {
        const bannerRes = await apiClientBanner.get(`/${BigSizeBannerStOrd}`);

        console.log("Banner request URL:", bannerRes.config?.url);
        console.log("Banner response:", bannerRes.data);

        const bannerResult = bannerRes.data?.data || bannerRes.data;

        const selectedBanner = Array.isArray(bannerResult)
          ? bannerResult[0] || null
          : bannerResult || null;

        if (isMounted) {
          setBanner(selectedBanner);

          console.log("Banner image URL:", getImageUrl(selectedBanner?.image));
        }
      } catch (err) {
        console.error("Banner request error:", err);

        if (isMounted) {
          setBanner(null);
        }
      }
    };

    setError("");

    fetchShoes();
    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, [myQuery]);

  return (
    <div className="container">
      {error && (
        <p className="my-4 text-center text-sm text-red-500">{error}</p>
      )}

      {banner?.image && (
        <div className="mb-0 w-full overflow-hidden rounded-2xl">
          <img
            src={getImageUrl(banner.image)}
            alt={banner.title1 || "New arrivals banner"}
            className="block aspect-[16/5] w-full object-contain"
            onError={(event) => {
              console.error("Banner image failed:", event.currentTarget.src);
            }}
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
