import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaCaretDown, FaCartShopping, FaXmark } from "react-icons/fa6";
import apiClientAuth from "../../services/api-client_auth";

const adminLinks = [
  ["Add Brand", "/admin/dashboard/brand-upload"],
  ["Add New Product", "/admin/dashboard/shoe-upload"],
  ["Manage Products", "/admin/dashboard/shoes-manager"],
  ["Manage Users", "/admin/dashboard/users-manager"],
  ["Manage Carts", "/admin/dashboard/carts"],
  ["Manage Orders", "/admin/dashboard/orders"],
  ["Add Banners", "/admin/dashboard/banner-upload"],
  ["Set Discount Prices", "/admin/dashboard/set-discount-prices"],
  ["Discount Codes Manager", "/admin/dashboard/discount-code-manager"],
];

const brands = [
  "Zegna",
  "Gucci",
  "Prada",
  "Dior",
  "Louis Vuitton",
  "Fendi",
  "Hermes",
  "Loro Piana Slippers",
  "Cristian Louboutin",
  "Santony",
  "Valentino",
  "Aquazzura",
  "Rolex",
  "Bvlgari",
  "Chopard",
  "Cartier",
];

const shoeStyles = [
  ["Sneakers", "sneaker"],
  ["Loafers", "loafer"],
  ["Formal", "formal"],
  ["Boots", "boot"],
  ["Sandals", "sandal"],
  ["Sport", "sport"],
  ["Classic", "classic"],
];

const menus = [
  {
    key: "shoes",
    label: "Shoes",
    type: "shoe",
    text: "Signature footwear, refined for every occasion.",
    cols: [
      [
        "Shop Shoes",
        [
          ["All Shoes", { type: "shoe" }],
          ["New Shoes", { type: "shoe", sort: "created_at", order: "DESC" }],
          ["Sale Shoes", { type: "shoe", discountOnly: "true" }],
        ],
      ],
      [
        "Shop By Style",
        shoeStyles.map(([name, category]) => [
          name,
          { type: "shoe", category },
        ]),
      ],
      [
        "Shop By Brand",
        brands.map((brand) => [
          brand,
          { type: "shoe", brand: brand.replace(/\s+/g, "") },
        ]),
      ],
    ],
  },
  {
    key: "bags",
    label: "Bags",
    type: "bag",
    text: "Luxury bags and travel pieces for modern style.",
    cols: [
      [
        "Shop Bags",
        [
          ["All Bags", { type: "bag" }],
          ["Travel Luggage", { type: "luggage" }],
          ["Sale Bags", { type: "bag", discountOnly: "true" }],
        ],
      ],
      [
        "Shop By Type",
        [
          ["Handbags", { type: "bag" }],
          ["Luggage", { type: "luggage" }],
          ["Belts", { type: "belt" }],
        ],
      ],
      [
        "Shop By Brand",
        brands.map((brand) => [
          brand,
          { type: "bag", brand: brand.replace(/\s+/g, "") },
        ]),
      ],
    ],
  },
  {
    key: "glasses",
    label: "Glasses",
    type: "glasses",
    text: "Sharp frames and luxury eyewear essentials.",
    cols: [
      [
        "Shop Glasses",
        [
          ["All Glasses", { type: "glasses" }],
          [
            "New Glasses",
            { type: "glasses", sort: "created_at", order: "DESC" },
          ],
          ["Sale Glasses", { type: "glasses", discountOnly: "true" }],
        ],
      ],
      [
        "Shop By Type",
        [
          ["Luxury Frames", { type: "glasses" }],
          [
            "Best Sellers",
            { type: "glasses", sort: "created_at", order: "DESC" },
          ],
        ],
      ],
      [
        "Shop By Brand",
        brands.map((brand) => [
          brand,
          { type: "glasses", brand: brand.replace(/\s+/g, "") },
        ]),
      ],
    ],
  },
  {
    key: "watches",
    label: "Watches",
    type: "watch",
    text: "Elegant timepieces with a luxury finish.",
    cols: [
      [
        "Shop Watches",
        [
          ["All Watches", { type: "watch" }],
          ["New Watches", { type: "watch", sort: "created_at", order: "DESC" }],
          ["Sale Watches", { type: "watch", discountOnly: "true" }],
        ],
      ],
      [
        "Shop By Type",
        [
          ["Dress Watches", { type: "watch" }],
          ["Luxury Watches", { type: "watch" }],
          ["Best Offers", { type: "watch", discountOnly: "true" }],
        ],
      ],
      [
        "Shop By Brand",
        brands.map((brand) => [
          brand,
          { type: "watch", brand: brand.replace(/\s+/g, "") },
        ]),
      ],
    ],
  },
];

const cls = (...x) => x.filter(Boolean).join(" ");

export default function TopNavbar({ handelOrderPopup }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mega, setMega] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [mobileMega, setMobileMega] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileAdmin, setMobileAdmin] = useState(false);

  const isMen = useMemo(() => {
    const gender = new URLSearchParams(search).get("gender");
    return pathname === "/men" || gender === "men" || gender === "male";
  }, [pathname, search]);

  const gender = isMen ? "male" : "female";
  const home = isMen ? "/men" : "/women";
  const section = isMen ? "Men" : "Women";

  const productLink = (params = {}) => {
    const q = new URLSearchParams({ gender, ...params });
    Object.keys(params).forEach((k) => {
      if (!params[k]) q.delete(k);
    });
    return `/slider-shoes?${q.toString()}`;
  };

  const navLinks = [
    ["Home", home],
    ["New Arrivals", productLink({ sort: "created_at", order: "DESC" })],
    ["Sale", productLink({ discountOnly: "true" })],
    ["All Products", productLink()],
  ];

  const closeAll = () => {
    setMega(null);
    setMobile(false);
    setMobileMega(null);
    setUserOpen(false);
    setAdminOpen(false);
    setMobileAdmin(false);
  };

  useEffect(() => {
    apiClientAuth
      .get("/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(closeAll, [pathname, search]);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobile]);

  const logout = async () => {
    try {
      await apiClientAuth.post("/logout");
      setUser(null);
      navigate(home);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const activeLink = (link) =>
    link === "/women"
      ? !isMen && ["/", "/women"].includes(pathname)
      : link === "/men"
        ? isMen && pathname === "/men"
        : pathname + search === link;

  const LinkList = ({ items, onClick, className = "" }) =>
    items.map(([name, link]) => (
      <Link key={name} to={link} onClick={onClick} className={className}>
        {name}
      </Link>
    ));

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl"
        onMouseLeave={() => setMega(null)}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link
              to={home}
              className="text-2xl font-semibold uppercase tracking-[0.35em] text-neutral-950"
            >
              Anilox
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map(([name, link]) => (
                <Link
                  key={name}
                  to={link}
                  className={cls(
                    "relative text-sm uppercase tracking-[0.18em] transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:bg-neutral-950 after:transition-all",
                    activeLink(link)
                      ? "text-neutral-950 after:w-full"
                      : "text-neutral-500 hover:text-neutral-950 after:w-0 hover:after:w-full",
                  )}
                >
                  {name}
                </Link>
              ))}

              {menus.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onMouseEnter={() => setMega(m.key)}
                  className={cls(
                    "flex items-center gap-2 text-sm uppercase tracking-[0.18em] transition-colors",
                    mega === m.key
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950",
                  )}
                >
                  {m.label}
                  <FaCaretDown
                    className={cls(
                      "text-xs transition-transform",
                      mega === m.key && "rotate-180",
                    )}
                  />
                </button>
              ))}

              {user?.role === "admin" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAdminOpen((p) => !p)}
                    className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-500 hover:text-neutral-950"
                  >
                    Admin
                    <FaCaretDown
                      className={cls(
                        "text-xs transition-transform",
                        adminOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {adminOpen && (
                    <div className="absolute left-1/2 top-9 w-72 -translate-x-1/2 rounded-2xl border bg-white p-3 shadow-2xl">
                      <LinkList
                        items={adminLinks}
                        className="block rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                      />
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-full border bg-neutral-50 p-1 md:flex">
                {[
                  ["Women", "/women", !isMen],
                  ["Men", "/men", isMen],
                ].map(([name, link, active]) => (
                  <Link
                    key={name}
                    to={link}
                    className={cls(
                      "rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]",
                      active
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-500 hover:text-neutral-950",
                    )}
                  >
                    {name}
                  </Link>
                ))}
              </div>

              <Link
                to="/basket"
                onClick={handelOrderPopup}
                className="rounded-full border border-neutral-200 p-3 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
                aria-label="Basket"
              >
                <FaCartShopping className="text-lg" />
              </Link>

              <div className="hidden sm:block">
                {loading ? (
                  <button
                    disabled
                    className="rounded-full border px-5 py-2 text-sm text-neutral-400"
                  >
                    Loading
                  </button>
                ) : user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserOpen((p) => !p)}
                      className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      {user.name || user.username || "Account"}
                    </button>

                    {userOpen && (
                      <div className="absolute right-0 top-12 w-64 rounded-2xl border bg-white p-3 shadow-2xl">
                        <div className="border-b px-3 pb-3">
                          <p className="font-medium text-neutral-950">
                            {user.name || user.username}
                          </p>
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {user.email}
                          </p>
                          {user.role === "admin" && (
                            <span className="mt-2 inline-block rounded-full bg-neutral-950 px-3 py-1 text-xs text-white">
                              Admin
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={logout}
                          className="mt-2 w-full rounded-xl px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/LoginLogout"
                    className="rounded-full bg-neutral-950 px-6 py-2 text-sm font-medium text-white"
                  >
                    Login
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobile(true)}
                className="rounded-full border p-3 text-neutral-700 lg:hidden"
                aria-label="Open menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>

        {mega && (
          <div className="hidden border-t bg-white shadow-2xl lg:block">
            <MegaMenu
              menu={menus.find((m) => m.key === mega)}
              section={section}
              productLink={productLink}
            />
          </div>
        )}
      </header>

      <div
        className={cls(
          "fixed inset-0 z-[9999] transition-all",
          mobile ? "visible" : "invisible",
        )}
      >
        <div
          onClick={closeAll}
          className={cls(
            "absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity",
            mobile ? "opacity-100" : "opacity-0",
          )}
        />

        <aside
          className={cls(
            "absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform",
            mobile ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b px-5 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                {section}
              </p>
              <h2 className="text-xl font-semibold uppercase tracking-[0.25em] text-neutral-950">
                Anilox
              </h2>
            </div>

            <button
              type="button"
              onClick={closeAll}
              className="rounded-full border p-3 text-neutral-700"
            >
              <FaXmark />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b p-4">
            {[
              ["Women", "/women", !isMen],
              ["Men", "/men", isMen],
            ].map(([name, link, active]) => (
              <Link
                key={name}
                to={link}
                onClick={closeAll}
                className={cls(
                  "rounded-full px-4 py-3 text-center text-xs uppercase tracking-[0.16em]",
                  active
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-600",
                )}
              >
                {name}
              </Link>
            ))}
          </div>

          {!loading && user && (
            <div className="border-b bg-neutral-50 px-5 py-4">
              <p className="font-medium text-neutral-950">
                {user.name || user.username}
              </p>
              <p className="mt-1 truncate text-sm text-neutral-500">
                {user.email}
              </p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto py-2">
            <LinkList
              items={navLinks}
              onClick={closeAll}
              className="block px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
            />

            <div className="border-t">
              {menus.map((m) => (
                <div key={m.key} className="border-b">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileMega((p) => (p === m.key ? null : m.key))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-700"
                  >
                    {m.label}
                    <FaCaretDown
                      className={cls(
                        "transition-transform",
                        mobileMega === m.key && "rotate-180",
                      )}
                    />
                  </button>

                  {mobileMega === m.key && (
                    <div className="bg-neutral-50 px-5 pb-5">
                      <p className="pb-4 text-sm leading-6 text-neutral-500">
                        {m.text}
                      </p>

                      {m.cols.map(([title, links]) => (
                        <div key={title} className="mb-5">
                          <h4 className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
                            {title}
                          </h4>
                          {links.map(([name, params]) => (
                            <Link
                              key={name}
                              to={productLink(params)}
                              onClick={closeAll}
                              className="block py-1 text-sm text-neutral-600 hover:text-neutral-950"
                            >
                              {name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {user?.role === "admin" && (
              <div className="border-t">
                <button
                  type="button"
                  onClick={() => setMobileAdmin((p) => !p)}
                  className="flex w-full items-center justify-between px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-600"
                >
                  Admin Panel
                  <FaCaretDown
                    className={cls(
                      "transition-transform",
                      mobileAdmin && "rotate-180",
                    )}
                  />
                </button>

                {mobileAdmin && (
                  <div className="bg-neutral-50 py-2">
                    <LinkList
                      items={adminLinks}
                      onClick={closeAll}
                      className="block px-8 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    />
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="border-t p-4">
            {!loading && user ? (
              <button
                type="button"
                onClick={() => {
                  closeAll();
                  logout();
                }}
                className="w-full rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/LoginLogout"
                onClick={closeAll}
                className="block w-full rounded-full bg-neutral-950 px-5 py-3 text-center text-sm font-medium text-white"
              >
                Login / Register
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function MegaMenu({ menu, section, productLink }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 rounded-3xl bg-neutral-950 p-7 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            {section} Collection
          </p>
          <h3 className="mt-4 text-3xl font-light uppercase tracking-[0.18em]">
            {menu.label}
          </h3>
          <p className="mt-4 text-sm leading-6 text-neutral-300">{menu.text}</p>

          <Link
            to={productLink({ type: menu.type })}
            className="mt-8 inline-block rounded-full border border-white/30 px-5 py-3 text-xs uppercase tracking-[0.18em] hover:bg-white hover:text-neutral-950"
          >
            Explore All
          </Link>
        </div>

        <div className="col-span-9 grid grid-cols-3 gap-8">
          {menu.cols.map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-xs uppercase tracking-[0.22em] text-neutral-400">
                {title}
              </h4>

              {links.map(([name, params]) => (
                <Link
                  key={name}
                  to={productLink(params)}
                  className="mb-3 block text-sm text-neutral-600 hover:text-neutral-950"
                >
                  {name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
