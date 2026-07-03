import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({
  shoes,
  header,
  title,
  navigateLink,
  scrollOnMobile = false,
  apiUrl = "http://localhost:4000/v1/shoes",
  limit = 20,
}) => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState(shoes || []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);

  useEffect(() => {
    setProducts(shoes || []);
    setPage(1);
    setTotalPages(null);
  }, [shoes]);

  const getDiscountPercentage = (price, discountPrice) => {
    if (!price || !discountPrice) return null;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const fetchMoreProducts = useCallback(async () => {
    if (loading) return;
    if (totalPages && page >= totalPages) return;

    setLoading(true);

    try {
      const nextPage = page + 1;

      const params = new URLSearchParams(searchParams);
      params.set("page", nextPage);
      params.set("limit", limit);

      const res = await fetch(`${apiUrl}?${params.toString()}`);
      const result = await res.json();

      setProducts((prev) => [...prev, ...(result.data || [])]);
      setPage(result.pagination?.page || nextPage);
      setTotalPages(result.pagination?.totalPages || null);
    } catch (error) {
      console.log("ProductCard infinite scroll error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchParams, page, limit, loading, totalPages]);

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreProducts();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, fetchMoreProducts],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <Link to={navigateLink} className="inline-block">
          <h1 className="text-3xl md:text-4xl font-light tracking-wider uppercase text-gray-800 hover:text-gray-600 transition-colors">
            {header}
          </h1>
          <p className="text-sm text-gray-400 mt-2 tracking-wide">{title}</p>
        </Link>
      </div>

      <div className="relative">
        <div
          className={
            scrollOnMobile
              ? "flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scroll-smooth"
              : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          }
        >
          {products.map((shoe, index) => {
            const discountPercentage = getDiscountPercentage(
              shoe.price,
              shoe.discount_price,
            );

            const isLastProduct = index === products.length - 1;

            return (
              <Link
                ref={isLastProduct ? lastProductRef : null}
                to={`/shoe/${shoe._id || shoe.id}`}
                key={shoe._id || shoe.id || index}
                className={
                  scrollOnMobile
                    ? "group block flex-shrink-0 w-[160px] sm:w-[200px] md:w-auto"
                    : "group block w-full"
                }
              >
                <div className="relative bg-gray-50 overflow-hidden">
                  {shoe?.images?.[0]?.image_name ? (
                    <img
                      src={`http://localhost:4000/images/posts/${shoe.images[0].image_name}`}
                      alt={shoe.name}
                      className="w-full aspect-square object-cover group-hover:opacity-90 transition-opacity duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-medium">
                      {discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-normal text-gray-800 truncate">
                    {shoe.name}
                  </h3>

                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {shoe.brand || "Brand"}
                  </p>

                  <div className="flex items-baseline gap-2">
                    {shoe.discount_price ? (
                      <>
                        <span className="text-sm font-medium text-gray-900">
                          ${shoe.discount_price?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ${shoe.price?.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        ${shoe.price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="text-center text-sm text-gray-400 py-8">
          Loading more...
        </p>
      )}

      {products.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-500">
            No products found
          </h3>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
