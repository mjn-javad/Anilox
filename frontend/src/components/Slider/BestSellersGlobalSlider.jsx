import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import apiClientBrandPopular from "../../services/api-client";
import ProductCard from "./ProductCart";

const BestSellersGlobalSlider = ({
  header,
  title,
  navigateLink,
  limit = 20,
}) => {
  const [searchParams] = useSearchParams();

  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState("");

  const gender = searchParams.get("gender");

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setError("");

        const params = new URLSearchParams();

        params.set("limit", limit);

        if (gender) {
          params.set("gender", gender);
        }

        const res = await apiClientBrandPopular.get(
          `/bestSellers?${params.toString()}`,
        );

        setShoes(res.data?.data || []);
      } catch (err) {
        console.error("Get best sellers error:", err);
        setError("Failed to load best sellers");
      }
    };

    fetchBestSellers();
  }, [gender, limit]);

  return (
    <div className="container mx-auto">
      {error && (
        <p className="my-4 text-center text-sm text-red-500">{error}</p>
      )}

      <ProductCard
        shoes={shoes}
        header={header}
        title={title}
        navigateLink={navigateLink}
        apiUrl="/api/v1/brandPopular/bestSellers"
        scrollOnMobile={false}
        infiniteScroll={false}
      />
    </div>
  );
};

export default BestSellersGlobalSlider;
