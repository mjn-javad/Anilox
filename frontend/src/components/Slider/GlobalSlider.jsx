import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClientProducts from "../../services/api-client_products";
import ProductCard from "./ProductCart";
import ProductFinderBox from "../OrderOnWhatsApp/ProductFinderBox";
import BrandScroller from "../HorizentalScroll/BrandScroller";

const GlobalSlider = ({
  myQuery,
  header,
  title,
  navigateLink,
  limit,
  infiniteScroll = true,
  scrollOnMobile = false,
  scrollOnLaptop = false,
}) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");

  const { search } = useLocation();

  useEffect(() => {
    const [path, queryString = ""] = myQuery.split("?");

    const params = new URLSearchParams(queryString);
    const currentParams = new URLSearchParams(search);

    currentParams.forEach((value, key) => {
      params.set(key, value);
    });

    const finalQuery = params.toString();
    const requestQuery = finalQuery ? `${path}?${finalQuery}` : path;

    apiClientProducts
      .get(requestQuery)
      .then((res) => {
        setProducts(res.data?.data || []);
        setBrands(res.data?.brands || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products");
      });
  }, [myQuery, search]);

  return (
    <div className="container">
      {limit === undefined && <ProductFinderBox />}

      {limit === undefined && <BrandScroller brands={brands} />}

      <ProductCard
        products={products}
        header={header}
        title={title}
        navigateLink={navigateLink}
        apiUrl="/api/v1/products"
        limit={limit}
        infiniteScroll={infiniteScroll}
        scrollOnMobile={scrollOnMobile}
        scrollOnLaptop={scrollOnLaptop}
      />
    </div>
  );
};

export default GlobalSlider;
