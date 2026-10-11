import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import SaleShell from "./SaleShell";

const imageSrc = (product, size = 640) => {
  const image = product?.images?.[0]?.image_name;
  if (!image) return "/defaultProduct.jpg";
  const base = image.replace(/\.[^/.]+$/, "").replace(/-(320|640|960)$/i, "");
  return `/api/images/posts/${base}-${size}.webp`;
};

const label = (value = "") => String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const SaleProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams({ saleOnly: "true", type: "shoe", gender: "male", limit: "50" });
    ["brand", "category", "search", "sort", "order"].forEach((key) => { const value = searchParams.get(key); if (value) params.set(key, value); });
    return params;
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/products?${query.toString()}`).then((response) => response.json()).then(async (result) => {
      const pages = Number(result?.pagination?.totalPages) || 1;
      const rest = pages > 1 ? await Promise.all(Array.from({ length: pages - 1 }, (_, index) => fetch(`/api/v1/products?${query.toString()}&page=${index + 2}`).then((response) => response.json()))) : [];
      if (active) setProducts([...(result?.data || []), ...rest.flatMap((page) => page?.data || [])]);
    }).catch(() => active && setError("Could not load sale products.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query]);

  const title = searchParams.get("brand") ? label(searchParams.get("brand")) : searchParams.get("category") ? label(searchParams.get("category")) : "All Sale Shoes";
  return <SaleShell><section className="sale-catalog">
    <div className="sale-catalog__head"><div><h1>{title}</h1><p>Only products selected for the ANLIOX sale.</p></div><form className="sale-catalog__search" action="/sale/products"><input name="search" defaultValue={searchParams.get("search") || ""} placeholder="Search sale" /><button aria-label="Search"><Search size={19} /></button></form></div>
    {loading && <div className="sale-empty">Loading...</div>}{error && <div className="sale-empty">{error}</div>}
    {!loading && !error && products.length === 0 && <div className="sale-empty"><h1>No sale products found</h1><p>This collection does not have an active sale product yet.</p><Link to="/sale">Back to Sale</Link></div>}
    <div className="sale-catalog__grid">{products.map((product) => { const price = Number(product.price); const sale = Number(product.discount_price); const discounted = sale > 0 && sale < price; return <Link className="sale-card" key={product.id} to={`/sale/product/${product.id}`}><div className="sale-card__image"><img src={imageSrc(product)} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/defaultProduct.jpg"; }} />{discounted && <span>SALE</span>}</div><h2>{product.name}</h2><p className="sale-card__brand">{label(product.brand)}</p><p className="sale-card__price">{discounted && <s>{price.toLocaleString()} AED</s>}<b>{(discounted ? sale : price).toLocaleString()} AED</b></p></Link>; })}</div>
  </section></SaleShell>;
};

export default SaleProducts;
