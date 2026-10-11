import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import "./SaleLanding.css";
import "../components/Sale/SaleTypography.css";

const endpoints = {
  products: "/api/v1/brandPopular/sale?type=shoe&gender=male&limit=50",
  best: "/api/v1/brandPopular/bestSellers?gender=male&saleOnly=true",
  new: "/api/v1/brandPopular/newArrivels?gender=male&saleOnly=true",
  brands: "/api/v1/brandPopular/",
};

const faqs = [
  ["How long does delivery take?", "Delivery usually takes 1–3 business days across the UAE."],
  ["What are the payment methods?", "Available payment methods are shown securely at checkout."],
  ["How much is delivery?", "Delivery is free across the UAE."],
  ["Can I exchange the size?", "Yes, size exchange is available within 7 days of delivery."],
];

const topMessages = [
  "FREE NEXT DAY DELIVERY 🚚",
  "✨ 7 DAYS SIZE EXCHANGE",
  "💰 COMPLETE REFUND POLICY",
  "🔄 EASY RETURNS",
  "📞 24/7 CUSTOMER SUPPORT",
];

const serviceMessages = [
  "FREE SHIPPING ALL OVER UAE",
  "CHECK BEFORE YOU PAY",
  "EASY & FREE RETURNS",
  "7 DAYS HASSLE FREE EXCHANGE POLICY",
];

const collections = [
  { label: "Loro Piana", image: "/sale-collection-loro-piana.webp", brand: "loroPiana", featured: true },
  { label: "Zegna", image: "/sale-collection-zegna.webp", brand: "zegna", featured: true },
  { label: "Maison Margiela", image: "/sale-collection-maison-margiela.webp", brand: "maisonMargiela" },
  { label: "Brunello Cucinelli", image: "/sale-collection-brunello-cucinelli.webp", brand: "brunelloCucinelli" },
  { label: "Dior", image: "/sale-collection-dior.webp", brand: "dior" },
  { label: "Dolce & Gabbana", image: "/sale-collection-dolce-gabbana.webp", brand: "dolceGabbana" },
  { label: "Golden Goose", image: "/sale-collection-golden-goose.webp", brand: "goldenGoose" },
  { label: "Hermes", image: "/sale-collection-hermes.webp", brand: "hermes" },
  { label: "Louis Vuitton", image: "/sale-collection-louis-vuitton.webp", brand: "louisVuitton" },
  { label: "Loro Piana Slippers", image: "/sale-collection-loro-piana-slippers.webp", brand: "loroPianaSlippers" },
  { label: "Hermes Slippers", image: "/sale-collection-hermes-slippers.webp", brand: "hermes", category: "slipper" },
];

const collectionLink = ({ brand, category }) => {
  const params = new URLSearchParams({ type: "shoe", gender: "male", brand, saleOnly: "true" });
  if (category) params.set("category", category);
  return `/sale/products?${params.toString()}`;
};

function Ticker({ messages, variant, label }) {
  return <div className={`ms-ticker ms-ticker--${variant}`} aria-label={label}>
    <div className="ms-ticker__track">
      {[0, 1].map((copy) => <div className="ms-ticker__group" aria-hidden={copy === 1} key={copy}>
        {messages.map((message) => <span key={`${copy}-${message}`}>{message}</span>)}
      </div>)}
    </div>
  </div>;
}

const isMensShoe = (product) =>
  String(product?.type || "shoe").toLowerCase() === "shoe" &&
  ["male", "genderless", ""].includes(String(product?.gender || "").toLowerCase());

const normalize = (value) => (Array.isArray(value) ? value : []).filter(isMensShoe);

const brandLabel = (name = "") =>
  String(name)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const brandKey = (name = "") => String(name).trim().toLowerCase().replace(/[\s-]+/g, "_");

const brandColor = (name = "") => {
  const colors = ["#eadfd6", "#dce8e2", "#e4e0ef", "#eee1c8", "#dce5ef", "#eadde4"];
  const value = [...String(name)].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return colors[value % colors.length];
};

function BrandBubbleVisual({ brand, name }) {
  const [failed, setFailed] = useState(false);
  const image = brand?.image;
  if (!image || failed) {
    return <span className="ms-brand-bubble__fallback" style={{ backgroundColor: brandColor(name) }} aria-hidden="true" />;
  }
  const src = image.startsWith("http") ? image : `/api/images/barnds/${image}`;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

const imageUrl = (product, size = 640) => {
  const name = product?.images?.[0]?.image_name;
  if (!name) return "/defaultProduct.jpg";
  const base = name.replace(/\.[^/.]+$/, "").replace(/-(320|640|960)$/i, "");
  return `/api/images/posts/${base}-${size}.webp`;
};

const fallbackImage = (product) => {
  const name = product?.images?.[0]?.image_name;
  if (!name) return "/defaultProduct.jpg";
  return `/api/images/posts/${name.replace(/\.[^/.]+$/, "").replace(/-(320|640|960)$/i, "")}.webp`;
};

function ShoeImage({ product, alt = "", className = "" }) {
  return (
    <img className={className} src={imageUrl(product)} alt={alt} loading="lazy"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackImage(product);
      }}
    />
  );
}

function ProductCard({ product }) {
  const price = Number(product.price);
  const sale = Number(product.discount_price);
  const discounted = sale > 0 && sale < price;
  return (
    <Link className="ms-product" to={`/sale/product/${product.id || product._id}`}>
      <div className="ms-product__image">
        <ShoeImage product={product} alt={product.name} />
        {discounted && <span>Sale</span>}
      </div>
      <h3>{product.name || product.model}</h3>
      <p className="ms-product__brand">{brandLabel(product.brand || "ANLIOX")}</p>
      <p className="ms-product__price">
        {price === 1 ? "Price on WhatsApp" : <>{discounted && <s>Dhs. {price.toLocaleString()}</s>}<b>Dhs. {(discounted ? sale : price).toLocaleString()} AED</b></>}
      </p>
    </Link>
  );
}

function ProductSection({ title, subtitle, products }) {
  if (!products.length) return null;
  return (
    <section className="ms-products-section">
      <h2>{title}</h2><p>{subtitle}</p>
      <div className="ms-products-rail">
        {products.map((product) => <ProductCard key={product.id || product._id} product={product} />)}
      </div>
    </section>
  );
}

function SaleLanding() {
  const [products, setProducts] = useState([]);
  const [best, setBest] = useState([]);
  const [newest, setNewest] = useState([]);
  const [brandRecords, setBrandRecords] = useState([]);
  const [saleBanner, setSaleBanner] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetch(endpoints.products).then((response) => response.json()),
      fetch(endpoints.best).then((response) => response.json()),
      fetch(endpoints.new).then((response) => response.json()),
      fetch(endpoints.brands).then((response) => response.json()),
    ]).then(async ([allResult, bestResult, newResult, brandsResult]) => {
      if (!active) return;
      const firstPage = normalize(allResult.value?.data);
      const totalPages = Number(allResult.value?.pagination?.totalPages) || 1;
      const remainingResponses = totalPages > 1
        ? await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              fetch(`${endpoints.products}&page=${index + 2}`).then((response) => response.json()),
            ),
          )
        : [];
      const all = [
        ...firstPage,
        ...remainingResponses.flatMap((result) => normalize(result?.data)),
      ];
      if (!active) return;
      const popular = normalize(bestResult.value?.data);
      const arrivals = normalize(newResult.value?.data);
      setProducts(all);
      setBest(popular);
      setNewest(arrivals.length ? arrivals : all.slice(0, 16));
      setBrandRecords(Array.isArray(brandsResult.value?.data) ? brandsResult.value.data : []);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/v1/banner/12")
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        const banners = Array.isArray(result?.data) ? result.data : [];
        setSaleBanner(banners.find((banner) => Number(banner.is_active) !== 0) || null);
      })
      .catch(() => {
        if (active) setSaleBanner(null);
      });

    return () => { active = false; };
  }, []);

  const brandRecordMap = useMemo(() => {
    const map = new Map();
    brandRecords.forEach((brand) => {
      map.set(brandKey(brand.slug), brand);
      map.set(brandKey(brand.name), brand);
    });
    return map;
  }, [brandRecords]);

  const brands = useMemo(() => {
    const grouped = new Map();
    products.forEach((product) => {
      const key = String(product.brand || "").trim();
      if (!key) return;
      const current = grouped.get(key) || [];
      if (current.length < 2) current.push(product);
      grouped.set(key, current);
    });
    return [...grouped.entries()].slice(0, 12);
  }, [products]);

  return (
    <div className="ms-page">
      <Helmet><title>Men's Shoes | ANLIOX</title><meta name="description" content="Shop men's designer shoes at ANLIOX." /></Helmet>
      <Ticker messages={topMessages} variant="top" label="ANLIOX services" />
      <header className="ms-header">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
        <Link className="ms-logo" to="/sale">ANLIOX</Link>
        <div><button onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Search /></button><Link to="/sale/basket" aria-label="Bag"><ShoppingBag /></Link></div>
        {searchOpen && <form className="ms-search" action="/sale/products"><Search /><input autoFocus name="search" placeholder="Search sale shoes" /><button type="button" onClick={() => setSearchOpen(false)}><X /></button></form>}
      </header>

      <main>
        <Link className="ms-hero-link" to={saleBanner?.bannerLink || "/sale"} aria-label={saleBanner?.title1 || "ANLIOX Sale"}>
          <img
            className="ms-hero"
            src={saleBanner?.image ? (saleBanner.image.startsWith("http") ? saleBanner.image : `/api/images/banners/${saleBanner.image}`) : "/anliox-sale-hero.webp"}
            alt={saleBanner?.title1 || "Make Every Step Stylish"}
          />
        </Link>
        <Ticker messages={serviceMessages} variant="service" label="Shopping benefits" />

        {!!brands.length && <nav className="ms-brand-bubbles" aria-label="Shoe brands">
          {brands.map(([name]) => <Link key={name} to={`/sale/products?brand=${encodeURIComponent(name)}`}><span><BrandBubbleVisual brand={brandRecordMap.get(brandKey(name))} name={name} /></span><b>{brandLabel(brandRecordMap.get(brandKey(name))?.name || name)}</b></Link>)}
        </nav>}

        <ProductSection title="BEST SELLERS" subtitle="Our customers love these!" products={best} />
        <ProductSection title="NEW KICKS" subtitle="Fresh arrivals are here!" products={newest} />

        <section className="ms-why">
          <h2>Why ANLIOX?</h2>
          <p>Premium designer footwear, dependable service, and a simple shopping experience from order to delivery.</p>
          <div className="ms-why__table" role="table" aria-label="Why choose ANLIOX">
            <div className="ms-why__row ms-why__head" role="row"><b>Feature</b><b>ANLIOX</b><b>Others</b></div>
            {["Premium Quality", "Free Shipping", "7-Day Size Exchange", "Check Before You Pay"].map((feature) =>
              <div className="ms-why__row" role="row" key={feature}><span>{feature}</span><strong>✓</strong><i>×</i></div>
            )}
          </div>
        </section>

        <section className="ms-collections">
          <h2>Collections</h2>
          <div className="ms-collections__grid">{collections.map((collection) => <Link className={`ms-collection-card${collection.featured ? " ms-collection-card--featured" : ""}`} key={collection.label} to={collectionLink(collection)}>
            <img src={collection.image} alt={collection.label} loading="lazy" />
            <p>{collection.label} <ChevronRight /></p>
          </Link>)}</div>
        </section>

        <section className="ms-faq"><h2>Frequently Asked Questions</h2>
          {faqs.map(([question, answer], index) => <article className={openFaq === index ? "open" : ""} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>{question}<ChevronDown /></button><div><p>{answer}</p></div></article>)}
        </section>
      </main>

      <footer className="ms-footer"><Link className="ms-logo" to="/sale">ANLIOX</Link><p>Men's designer footwear in the UAE.</p><div><a href="https://www.instagram.com/anilox.stop" target="_blank" rel="noreferrer">Instagram</a><a href="https://wa.me/971505676523" target="_blank" rel="noreferrer">WhatsApp</a></div><small>© {new Date().getFullYear()} ANLIOX</small></footer>
      <div className={`ms-drawer ${menuOpen ? "open" : ""}`}><button className="ms-drawer__shade" onClick={() => setMenuOpen(false)} aria-label="Close menu" /><aside><button onClick={() => setMenuOpen(false)}><X /></button><Link to="/sale">Home</Link><Link to="/sale/products">Shop</Link>{brands.slice(0, 8).map(([name]) => <Link key={name} to={`/sale/products?brand=${encodeURIComponent(name)}`}>{brandLabel(name)}</Link>)}</aside></div>
    </div>
  );
}

export default SaleLanding;
