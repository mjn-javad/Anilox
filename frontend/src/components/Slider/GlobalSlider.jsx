import React from "react";
import { useState, useEffect } from "react";
import apiClientShoes from "../../services/api-client_shoes";
import ProductCard from "./ProductCart";
import ProductFinderBox from "../OrderOnWhatsApp/ProductFinderBox";
import BrandScroller from "../HorizentalScroll/BrandScroller";

const GlobalSlider = ({ myQuery, header, title, navigateLink, limit }) => {
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClientShoes
      .get(myQuery)
      .then((res) => setShoes(res.data.data))
      .catch((err) => setError("err: ", err));
  }, [myQuery]);

  return (
    <div className="container">
      {limit === undefined && <ProductFinderBox />}
      {limit === undefined && <BrandScroller />}
      <ProductCard
        shoes={shoes}
        header={header}
        title={title}
        navigateLink={navigateLink}
        scrollOnMobile={limit !== undefined}
        apiUrl="http://localhost:4000/v1/shoes"
        limit={limit}
        infiniteScroll={false}
      />
    </div>
  );
};

export default GlobalSlider;
