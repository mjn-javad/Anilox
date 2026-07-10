import React, { useEffect, useState } from "react";
import apiClientBrandPopular from "../../services/api-client";
import ProductCard from "./ProductCart";
import ProductFinderBox from "../OrderOnWhatsApp/ProductFinderBox";
import BrandScroller from "../HorizentalScroll/BrandScroller";

const BigSizeGlobalSlider = ({
  myQuery = "",
  header,
  title,
  navigateLink,
  limit,
}) => {
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNewArrivels();
  }, [myQuery]);

  const fetchNewArrivels = async () => {
    try {
      setError("");

      const res = await apiClientBrandPopular.get(`/newArrivels${myQuery}`);

      setShoes(res.data?.data || []);
    } catch (err) {
      console.error("Get new arrivels error:", err);
      setError("Failed to load new arrivals");
    }
  };

  return (
    <div className="container">
      {limit === undefined && <ProductFinderBox />}

      {/* <BrandScroller /> */}

      {error && (
        <p className="text-center text-red-500 text-sm my-4">{error}</p>
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

export default BigSizeGlobalSlider;
