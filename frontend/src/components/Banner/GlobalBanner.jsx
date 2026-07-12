import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClientBanner from "../../services/api-client_banner";

const IMAGE_BASE_URL = "/api/images/banners/";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${IMAGE_BASE_URL}${image}`;
};

const isExternalLink = (link) => {
  if (!link) return false;

  return (
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("tel:") ||
    link.startsWith("mailto:")
  );
};

const BannerButton = ({ title, link, secondary = false }) => {
  if (!title || !link) return null;

  const className = secondary
    ? `
        flex
        h-12
        items-center
        justify-center
        border
        border-white
        text-xs
        uppercase
        tracking-[0.28em]
        text-white
        transition-all
        duration-300
        hover:bg-white
        hover:text-black
        sm:text-sm
        lg:border-black
        lg:text-black
        lg:hover:bg-black
        lg:hover:text-white
      `
    : `
        flex
        h-12
        items-center
        justify-center
        bg-black
        text-xs
        uppercase
        tracking-[0.28em]
        text-white
        transition-all
        duration-300
        hover:bg-zinc-800
        sm:text-sm
      `;

  if (isExternalLink(link)) {
    return (
      <a href={link} target="_blank" rel="noreferrer" className={className}>
        {title}
      </a>
    );
  }

  return (
    <Link to={link} className={className}>
      {title}
    </Link>
  );
};

const GlobalBanner = ({ sort_order }) => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (sort_order === undefined || sort_order === null) {
      setBanners([]);
      setError("sort_order ارسال نشده است");
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setShowText(false);

    apiClientBanner
      .get(`/${sort_order}`)
      .then((res) => {
        const result = res.data?.data || res.data;

        const finalBanners = Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];

        if (!isMounted) return;

        setBanners(finalBanners);

        finalBanners.forEach((banner) => {
          if (!banner?.image) return;

          const image = new Image();
          image.src = getImageUrl(banner.image);
        });
      })
      .catch((err) => {
        console.log("Get banner error:", err);

        if (isMounted) {
          setError("خطا در دریافت اطلاعات بنر");
          setBanners([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sort_order]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        return (previousIndex + 1) % banners.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;

    setShowText(false);

    const timer = setTimeout(() => {
      setShowText(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentIndex, banners.length]);

  const handleBannerClick = (event) => {
    const currentBanner = banners[currentIndex];

    if (!currentBanner?.bannerLink) return;

    if (event.target.closest("a")) return;
    if (event.target.closest("button")) return;

    if (isExternalLink(currentBanner.bannerLink)) {
      window.open(currentBanner.bannerLink, "_blank", "noopener,noreferrer");

      return;
    }

    navigate(currentBanner.bannerLink);
  };

  const handleDotClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    if (index === currentIndex) return;

    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-stone-100">
        <div className="h-[520px] w-full animate-pulse bg-stone-100 sm:h-[620px] lg:h-[720px]" />
      </section>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) {
    return null;
  }

  const hasButtons =
    (currentBanner.btnTitle1 && currentBanner.btnLink1) ||
    (currentBanner.btnTitle2 && currentBanner.btnLink2);

  return (
    <section
      className={`
        relative
        h-[520px]
        w-full
        overflow-hidden
        bg-stone-100
        sm:h-[620px]
        lg:h-[720px]
        ${currentBanner.bannerLink ? "cursor-pointer" : ""}
      `}
      onClick={handleBannerClick}
    >
      {banners.map((banner, index) => (
        <img
          key={banner.id || index}
          src={getImageUrl(banner.image)}
          alt={banner.title1 || banner.title2 || "Modern Luxury Banner"}
          className={`
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
            transition-all
            duration-1000
            ease-in-out
            ${
              index === currentIndex
                ? "scale-100 opacity-100"
                : "scale-[1.02] opacity-0"
            }
          `}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/75 via-white/5 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-6 sm:px-10 md:px-16 lg:px-20">
          <div
            className={`
              max-w-[430px]
              transition-all
              duration-700
              ease-out
              ${
                showText
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-6 opacity-0"
              }
            `}
          >
            {currentBanner.title1 && (
              <h1 className="whitespace-pre-line font-serif text-[42px] leading-[0.95] tracking-tight text-black sm:text-[58px] md:text-[72px]">
                {currentBanner.title1.replace(/\\n/g, "\n")}
              </h1>
            )}

            {currentBanner.title2 && (
              <p className="mt-6 max-w-[380px] whitespace-pre-line text-sm leading-7 text-gray-200 sm:text-base md:text-lg lg:text-black">
                {currentBanner.title2.replace(/\\n/g, "\n")}
              </p>
            )}

            {hasButtons && (
              <div className="mt-8 flex w-[230px] flex-col gap-4 sm:w-[260px]">
                <BannerButton
                  title={currentBanner.btnTitle1}
                  link={currentBanner.btnLink1}
                />

                <BannerButton
                  title={currentBanner.btnTitle2}
                  link={currentBanner.btnLink2}
                  secondary
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7">
          {banners.map((banner, index) => (
            <button
              key={banner.id || index}
              type="button"
              aria-label={`نمایش بنر ${index + 1}`}
              onClick={(event) => handleDotClick(event, index)}
              className={`
                h-2
                rounded-full
                transition-all
                duration-300
                ${
                  index === currentIndex
                    ? "w-8 bg-white shadow-md"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }
              `}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default GlobalBanner;
