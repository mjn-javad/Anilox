import React from "react";
import { useState, useEffect } from "react";
import apiClientShoes from "../../services/api-client_shoes";
import ProductCard from "./ProductCart";
import ProductFinderBox from "../OrderOnWhatsApp/ProductFinderBox";

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
      <ProductFinderBox />
      <ProductCard
        shoes={shoes}
        header={header}
        title={title}
        navigateLink={navigateLink}
        scrollOnMobile={limit !== undefined}
        apiUrl="/api/v1/shoes"
      />
    </div>
  );
};

export default GlobalSlider;
