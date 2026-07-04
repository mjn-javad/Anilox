import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GlobalSlider from "./GlobalSlider";

const typeLabels = {
  shoe: "Shoes",
  bag: "Bags",
  glasses: "Glasses",
  watch: "Watches",
  luggage: "Luggage",
  belt: "Belts",
};

const categoryLabels = {
  sneaker: "Sneakers",
  loafer: "Loafers",
  formal: "Formal Shoes",
  boot: "Boots",
  sandal: "Sandals",
  sport: "Sport Shoes",
  classic: "Classic Shoes",
};

const formatText = (value = "") => {
  return value
    ?.replace(/[-_]+/g, " ")
    ?.replace(/([a-z])([A-Z])/g, "$1 $2")
    ?.replace(/\s+/g, " ")
    ?.trim()
    ?.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getGenderLabel = (gender) => {
  if (gender === "men" || gender === "male") return "Men";
  if (gender === "women" || gender === "female") return "Women";
  return "";
};

const SliderShoes = ({ limit }) => {
  const [searchParams] = useSearchParams();

  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const gender = searchParams.get("gender");
  const discountOnly = searchParams.get("discountOnly");
  const search = searchParams.get("search");

  const myQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (limit !== undefined) params.set("limit", limit);
    if (brand) params.set("brand", brand);
    if (model) params.set("model", model);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (gender) params.set("gender", gender);
    if (discountOnly) params.set("discountOnly", discountOnly);
    if (search) params.set("search", search);

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [limit, brand, model, category, type, gender, discountOnly, search]);

  const pageInfo = useMemo(() => {
    const genderLabel = getGenderLabel(gender);
    const brandLabel = brand ? formatText(brand) : "";
    const modelLabel = model ? formatText(model) : "";
    const typeLabel = typeLabels[type] || "Products";
    const categoryLabel = categoryLabels[category] || formatText(category);

    let header = "Explore Luxury Collection";
    let title = "Discover your perfect luxury item";

    if (discountOnly === "true") {
      header = genderLabel
        ? `${genderLabel} Sale Collection`
        : "Sale Collection";

      title = genderLabel
        ? `Limited-time luxury deals for ${genderLabel.toLowerCase()}`
        : "Limited-time luxury deals";

      return { header, title };
    }

    if (brandLabel && modelLabel) {
      header = genderLabel
        ? `${genderLabel} ${brandLabel} ${modelLabel}`
        : `${brandLabel} ${modelLabel}`;

      title = `Explore selected ${brandLabel} pieces from our luxury collection`;

      return { header, title };
    }

    if (brandLabel && type) {
      header = genderLabel
        ? `${genderLabel} ${brandLabel} ${typeLabel}`
        : `${brandLabel} ${typeLabel}`;

      title = genderLabel
        ? `Discover luxury ${brandLabel} ${typeLabel.toLowerCase()} for ${genderLabel.toLowerCase()}`
        : `Discover luxury ${brandLabel} ${typeLabel.toLowerCase()}`;

      return { header, title };
    }

    if (category && type === "shoe") {
      header = genderLabel ? `${genderLabel} ${categoryLabel}` : categoryLabel;

      title = genderLabel
        ? `Explore ${categoryLabel.toLowerCase()} designed for ${genderLabel.toLowerCase()}`
        : `Explore our luxury ${categoryLabel.toLowerCase()} collection`;

      return { header, title };
    }

    if (type) {
      header = genderLabel
        ? `Explore ${genderLabel} ${typeLabel}`
        : `Explore All ${typeLabel}`;

      title = genderLabel
        ? `Discover luxury ${typeLabel.toLowerCase()} for ${genderLabel.toLowerCase()}`
        : `Discover our luxury ${typeLabel.toLowerCase()} collection`;

      return { header, title };
    }

    if (genderLabel) {
      header = `${genderLabel} Luxury Collection`;
      title = `Discover luxury products selected for ${genderLabel.toLowerCase()}`;
    }

    return { header, title };
  }, [brand, model, category, type, gender, discountOnly]);

  return (
    <GlobalSlider
      myQuery={myQuery}
      header={pageInfo.header}
      title={pageInfo.title}
      navigateLink={`/slider-shoes${myQuery}`}
      limit={limit}
    />
  );
};

export default SliderShoes;
