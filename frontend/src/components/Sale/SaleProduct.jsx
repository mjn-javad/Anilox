import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClientCart from "../../services/api-client_order";
import apiClientAuth from "../../services/api-client_auth";
import OrderOnWhatsApp from "../OrderOnWhatsApp/OrderOnWhatsApp";
import SaleShell from "./SaleShell";
import "./SaleProductAdmin.css";

const imageName = (image) => typeof image === "string" ? image : image?.image_name;
const imageSrc = (image, size = 960) => {
  const name = imageName(image);
  if (!name) return "/defaultProduct.jpg";
  const base = name.replace(/\.[^/.]+$/, "").replace(/-(320|640|960)$/i, "");
  return `/api/images/posts/${base}-${size}.webp`;
};
const originalSrc = (image) => imageName(image) ? `/api/images/posts/${imageName(image)}` : "/defaultProduct.jpg";
const label = (value = "") => String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const SaleProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedStock, setSelectedStock] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [user, setUser] = useState(null);
  const mobileGalleryRef = useRef(null);

  useEffect(() => {
    let active = true;

    apiClientAuth
      .get("/me")
      .then((response) => {
        const authUser = response.data?.user || response.data?.data || response.data;
        if (active) setUser(authUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setProduct(null); setSelectedImage(0); setSelectedStock(""); setQuantity(1);
    fetch(`/api/v1/products/${id}`).then((response) => response.json()).then((result) => {
      const item = result?.data;
      if (active && item?.is_sale && item?.type === "shoe" && ["male", "genderless"].includes(item?.gender)) setProduct(item);
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!product?.model) return;
    const params = new URLSearchParams({ model: product.model, brand: product.brand, type: product.type, gender: product.gender, exactGender: "true", saleOnly: "true", limit: "50" });
    let active = true;
    fetch(`/api/v1/products?${params}`).then((response) => response.json()).then((result) => active && setColors(result?.data || [])).catch(() => {});
    return () => { active = false; };
  }, [product]);

  const addToCart = async () => {
    if (!selectedStock) return setMessage({ type: "error", text: "Please select a size." });
    try {
      setAdding(true); setMessage({ type: "", text: "" });
      await apiClientCart.post("/cart", { productId: product.id, stock: selectedStock, quantity, storefront: "sale" });
      setMessage({ type: "success", text: "Added to your Sale shopping bag." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Please sign in before adding this product." });
    } finally { setAdding(false); }
  };

  if (loading) return <SaleShell><div className="sale-empty">Loading...</div></SaleShell>;
  if (!product) return <SaleShell><div className="sale-empty"><h1>Sale product not found</h1><p>This item is not part of the active Sale collection.</p><Link to="/sale/products">View Sale products</Link></div></SaleShell>;

  const images = product.images?.length ? product.images : [null];
  const stocks = (product.stocks || []).filter((stock) => Number(stock.quantity) > 0);
  const price = Number(product.price);
  const sale = Number(product.discount_price);
  const discounted = sale > 0 && sale < price;
  const isAdmin = user?.role === "admin";

  const handleMobileGalleryScroll = () => {
    const gallery = mobileGalleryRef.current;
    if (!gallery?.clientWidth) return;
    setSelectedImage(Math.round(gallery.scrollLeft / gallery.clientWidth));
  };

  const scrollMobileGallery = (direction) => {
    const gallery = mobileGalleryRef.current;
    if (!gallery?.clientWidth) return;
    const nextIndex = Math.max(0, Math.min(images.length - 1, selectedImage + direction));
    gallery.scrollTo({ left: nextIndex * gallery.clientWidth, behavior: "smooth" });
    setSelectedImage(nextIndex);
  };

  return <SaleShell><section className="sale-product-page">
    <OrderOnWhatsApp productName={product.name} productPrice={`${(discounted ? sale : price).toLocaleString()} AED`} productId={product.id} phoneNumber="971505676523" />
    <Link className="sale-product-page__back" to="/sale/products">← Back to Sale</Link>
    <div className="sale-product"><div className="sale-product__gallery">
      <div className="sale-product__desktop-gallery"><div className="sale-product__main-image"><img src={imageSrc(images[selectedImage])} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = originalSrc(images[selectedImage]); }} /></div>{images.length > 1 && <div className="sale-product__thumbs">{images.map((image, index) => <button className={selectedImage === index ? "active" : ""} onClick={() => setSelectedImage(index)} key={`${imageName(image)}-${index}`}><img src={imageSrc(image, 320)} alt="" /></button>)}</div>}</div>
      <div className="sale-product__mobile-gallery">
        <div className="sale-product__mobile-track" ref={mobileGalleryRef} onScroll={handleMobileGalleryScroll}>
          {images.map((image, index) => <div className="sale-product__mobile-slide" key={`${imageName(image)}-mobile-${index}`}><img src={imageSrc(image)} alt={`${product.name} ${index + 1}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = originalSrc(image); }} /></div>)}
        </div>
        {images.length > 1 && <div className="sale-product__mobile-controls"><button type="button" onClick={() => scrollMobileGallery(-1)} disabled={selectedImage === 0} aria-label="Previous image">‹</button><span>{selectedImage + 1}/{images.length}</span><button type="button" onClick={() => scrollMobileGallery(1)} disabled={selectedImage === images.length - 1} aria-label="Next image">›</button></div>}
      </div>
    </div>
      <div className="sale-product__info"><div className="sale-product__title-row"><div><h1>{product.name}</h1><p className="sale-product__brand">{label(product.brand)}</p></div>{isAdmin && <div className="sale-product__admin"><Link to={`/admin/dashboard/editProduct/${product.id}`}>Edit</Link><Link to={`/admin/dashboard/product-upload/${product.id}`}>Add color</Link></div>}</div><div className="sale-product__price">{discounted && <s>{price.toLocaleString()} AED</s>}<b>{(discounted ? sale : price).toLocaleString()} AED</b></div>{product.description && <p className="sale-product__description">{product.description}</p>}
        {colors.length > 1 && <div className="sale-product__block"><h2>Colours</h2><div className="sale-product__options sale-product__colors">{colors.map((color) => <Link className={String(color.id) === String(id) ? "active" : ""} to={`/sale/product/${color.id}`} key={color.id}><img src={imageSrc(color.images?.[0], 320)} alt={color.colors || color.name} /></Link>)}</div></div>}
        <div className="sale-product__block"><h2>Select size (EU)</h2><div className="sale-product__options">{stocks.map((stock) => <button className={String(selectedStock) === String(stock.stock) ? "active" : ""} onClick={() => setSelectedStock(stock.stock)} key={stock.stock}>{stock.stock}</button>)}</div>{stocks.length === 0 && <p className="sale-product__description">Currently out of stock.</p>}</div>
        {selectedStock && <div className="sale-product__block"><h2>Quantity</h2><div className="sale-product__quantity"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity((value) => value + 1)}>+</button></div></div>}
        <button className="sale-product__add" onClick={addToCart} disabled={adding || stocks.length === 0}>{adding ? "Adding..." : stocks.length ? "ADD TO BAG" : "OUT OF STOCK"}</button>{message.text && <div className={`sale-product__message ${message.type}`}>{message.text}</div>}{message.type === "success" && <Link className="sale-product__cart-link" to="/sale/basket">View shopping bag</Link>}
      </div></div>
  </section></SaleShell>;
};

export default SaleProduct;
