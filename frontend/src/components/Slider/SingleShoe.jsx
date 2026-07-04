import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import apiClientShoes from "../../services/api-client_shoes";
import apiClientCart from "../../services/api-client_order";
import apiClientAuth from "../../services/api-client_auth";

import MessageAlert from "../Shared/MessageAlert";
import LoadingSpinner from "../Shared/LoadingSpinner";
import OrderOnWhatsApp from "../OrderOnWhatsApp/OrderOnWhatsApp";

const IMG_URL = "/api/images/posts/";

const SingleShoe = () => {
  const { id } = useParams();

  const [shoe, setShoe] = useState(null);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: "", text: "" });

  const images = shoe?.images || [];
  const sizes = (shoe?.sizes || []).filter((item) => item.quantity > 0);

  const currentColor =
    colors.find((item) => String(item.id || item._id) === String(id)) || null;

  const getId = (item) => item?.id || item?._id;

  const isAdmin = user?.role === "admin";

  const getImageSrc = (image) => {
    if (!image) return "";
    return IMG_URL + (typeof image === "string" ? image : image.image_name);
  };

  useEffect(() => {
    let active = true;

    apiClientAuth
      .get("/me")
      .then((res) => {
        const authUser = res.data?.user || res.data?.data || res.data;

        if (active) {
          setUser(authUser);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchShoe = async () => {
      setLoading(true);
      setError("");
      setSelectedImage(0);
      setSelectedSize("");
      setQuantity(1);
      setCartMessage({ type: "", text: "" });

      try {
        const res = await apiClientShoes.get(`/${id}`);
        if (active) setShoe(res.data.data);
      } catch {
        if (active) setError("There was a problem retrieving information");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchShoe();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!shoe?.model) return;

    let active = true;

    const fetchColors = async () => {
      try {
        const res = await apiClientShoes.get(`/?model=${shoe.model}`);
        if (active && res.data.success) setColors(res.data.data || []);
      } catch (err) {
        console.error("Error fetching colors:", err);
      }
    };

    fetchColors();

    return () => {
      active = false;
    };
  }, [shoe?.model]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setCartMessage({ type: "error", text: "Please select a size" });
      return;
    }

    setAddingToCart(true);
    setCartMessage({ type: "", text: "" });

    try {
      const res = await apiClientCart.post("/cart", {
        shoesId: getId(shoe),
        size: selectedSize,
        quantity,
        color: currentColor?.name || shoe?.color || null,
      });

      if (res.data.success) {
        setCartMessage({
          type: "success",
          text: "Product successfully added to cart",
        });

        setTimeout(() => {
          setCartMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (err) {
      setCartMessage({
        type: "error",
        text:
          err.response?.data?.message ===
          "Session expired. No refresh token provided."
            ? "Please log in to your account"
            : err.response?.data?.message || "An error occurred",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <MessageAlert message={error} type="error" />;
  if (!shoe) return <div className="text-center py-10">Shoes not found</div>;

  return (
    <div className="container mx-auto my-8 p-4">
      <OrderOnWhatsApp
        productName={shoe.name}
        productPrice={shoe.discount_price || shoe.price}
        productId={getId(shoe)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-[450px] flex items-center justify-center">
            {images[selectedImage] ? (
              <img
                src={getImageSrc(images[selectedImage])}
                alt={shoe.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400">No image available</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden bg-gray-50 transition-all ${
                    selectedImage === index
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={getImageSrc(image)}
                    alt={`${shoe.name} - ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{shoe.name}</h1>
              <p className="text-gray-600 text-lg">{shoe.brand}</p>
            </div>

            {isAdmin && (
              <Link
                to={`/admin/dashboard/editShoe/${getId(shoe)}`}
                className="shrink-0 rounded-full border border-gray-300 px-4 py-2 text-xs font-medium uppercase tracking-widest text-gray-700 transition hover:bg-black hover:text-white"
              >
                Edit
              </Link>
            )}
          </div>

          <div>
            {shoe.discount_price ? (
              <>
                <p className="text-2xl text-gray-500 line-through">
                  {shoe.price?.toLocaleString()} AED
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {shoe.discount_price?.toLocaleString()} AED
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold text-gray-800">
                {shoe.price?.toLocaleString()} AED
              </p>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed">{shoe.description}</p>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3">Select Color</h3>

              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const colorId = getId(color);
                  const isActive = String(colorId) === String(id);

                  return (
                    <Link
                      key={colorId}
                      to={`/shoe/${colorId}`}
                      className={`w-14 h-14 p-1 rounded-lg border-2 transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={getImageSrc(color?.images?.[0])}
                        alt={color.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3">Select Size</h3>

              <div className="flex flex-wrap gap-3">
                {sizes.map((item) => (
                  <button
                    key={item.id || item.size}
                    onClick={() => setSelectedSize(item.size)}
                    className={`w-12 h-12 border-2 rounded-lg transition-all font-medium ${
                      selectedSize === item.size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    {item.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {selectedSize && (
            <div className="flex items-center gap-4 mb-4">
              <label className="font-bold">Quantity:</label>

              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 text-xl font-bold bg-gray-50 hover:bg-gray-200 disabled:opacity-50"
                >
                  -
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 text-center py-2 focus:outline-none [appearance:textfield]"
                />

                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 text-xl font-bold bg-gray-50 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {cartMessage.text && (
            <MessageAlert message={cartMessage.text} type={cartMessage.type} />
          )}

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || sizes.length === 0}
            className={`w-full py-3 rounded-lg transition-all text-lg mt-6 ${
              addingToCart || sizes.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {addingToCart
              ? "Adding..."
              : sizes.length === 0
                ? "Out of stock"
                : "Add to basket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleShoe;
