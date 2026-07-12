import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({
  shoes,
  header,
  title,
  navigateLink,
  scrollOnMobile = false,
  scrollOnLaptop = false,
  infiniteScroll = true,

  apiUrl = "/api/v1/shoes",
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

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getDiscountPercentage = (price, discountPrice) => {
    if (!price || !discountPrice) return null;

    return Math.round(((price - discountPrice) / price) * 100);
  };

  const fetchMoreProducts = useCallback(async () => {
    if (!infiniteScroll) return;
    if (loading) return;
    if (totalPages && page >= totalPages) return;

    setLoading(true);

    try {
      const nextPage = page + 1;

      const params = new URLSearchParams(searchParams);

      params.set("page", nextPage);
      params.set("limit", limit);

      const separator = apiUrl.includes("?") ? "&" : "?";

      const response = await fetch(`${apiUrl}${separator}${params.toString()}`);

      const result = await response.json();

      setProducts((previousProducts) => [
        ...previousProducts,
        ...(result.data || []),
      ]);

      setPage(result.pagination?.page || nextPage);

      setTotalPages(result.pagination?.totalPages || null);
    } catch (error) {
      console.log("ProductCard infinite scroll error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchParams, page, loading, totalPages, infiniteScroll, limit]);

  const lastProductRef = useCallback(
    (node) => {
      if (!infiniteScroll || loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreProducts();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, fetchMoreProducts, infiniteScroll],
  );

  const productsContainerClass = `
    gap-4
    ${
      scrollOnMobile
        ? "flex overflow-x-auto pb-4 scroll-smooth"
        : "grid grid-cols-2"
    }
    ${
      scrollOnLaptop
        ? "md:flex md:gap-6 md:overflow-x-auto md:pb-4 md:scroll-smooth"
        : "md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0"
    }
  `;

  const productCardClass = `
    group block
    ${scrollOnMobile ? "w-[160px] flex-shrink-0 sm:w-[200px]" : "w-full"}
    ${
      scrollOnLaptop
        ? "md:w-[220px] md:flex-shrink-0 lg:w-[260px]"
        : "md:w-auto md:shrink"
    }
  `;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <Link to={navigateLink} className="inline-block">
          <h1 className="text-3xl font-light uppercase tracking-wider text-gray-800 transition-colors hover:text-gray-600 md:text-4xl">
            {header}
          </h1>

          <p className="mt-2 text-sm tracking-wide text-gray-400">{title}</p>
        </Link>
      </div>

      <div className="relative">
        <div className={productsContainerClass}>
          {products.map((shoe, index) => {
            const shoeId = shoe._id || shoe.id;

            const discountPercentage = getDiscountPercentage(
              shoe.price,
              shoe.discount_price,
            );

            const isLastProduct = index === products.length - 1;

            return (
              <Link
                key={shoeId || index}
                ref={infiniteScroll && isLastProduct ? lastProductRef : null}
                to={`/shoe/${shoeId}`}
                className={productCardClass}
              >
                <div className="relative overflow-hidden bg-gray-50">
                  {shoe?.images?.[0]?.image_name ? (
                    <img
                      src={`/api/images/posts/${shoe.images[0].image_name}`}
                      alt={shoe.name}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                      <ShoppingBag className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <span className="absolute right-2 top-2 bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      {discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="truncate text-sm font-normal text-gray-800">
                    {shoe.name}
                  </h3>

                  <p className="text-xs uppercase tracking-wide text-gray-400">
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

      {infiniteScroll && loading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading more...
        </p>
      )}

      {products.length === 0 && (
        <div className="py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-200" />

          <h3 className="text-lg font-light text-gray-500">
            No products found
          </h3>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
