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
  ["Manage Banners", "/admin/dashboard/banners"],
  ["Set Discount Prices", "/admin/dashboard/set-discount-prices"],
  ["Discount Codes Manager", "/admin/dashboard/discount-code-manager"],
];

const shoeTypes = [
  ["Sneakers", "sneaker"],
  ["Loafers", "loafer"],
  ["Formal", "formal"],
  ["Boots", "boot"],
  ["Sandals", "sandal"],
  ["Sport", "sport"],
  ["Classic", "classic"],
];

const cls = (...x) => x.filter(Boolean).join(" ");

export default function TopNavbar({ handelOrderPopup }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [shoeOpen, setShoeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const isMen = useMemo(() => {
    const g = new URLSearchParams(search).get("gender");
    return pathname === "/men" || g === "men" || g === "male";
  }, [pathname, search]);

  const gender = isMen ? "male" : "female";
  const home = isMen ? "/men" : "/women";
  const section = isMen ? "Men" : "Women";

  const link = (params = {}) => {
    const q = new URLSearchParams({ gender, ...params });
    Object.keys(params).forEach((k) => !params[k] && q.delete(k));
    return `/slider-shoes?${q}`;
  };

  const mainLinks = [
    ["Home", home],
    ["New", link({ sort: "created_at", order: "DESC" })],
    ["Sale", link({ discountOnly: "true" })],
    ["Shoes", link({ type: "shoe" }), "shoe"],
    ["Bags", link({ type: "bag" }), "bag"],
    ["Watches", link({ type: "watch" }), "watch"],
    ["Glasses", link({ type: "glasses" }), "glasses"],
  ];

  const closeAll = () => {
    setMobile(false);
    setUserOpen(false);
    setShoeOpen(false);
    setAdminOpen(false);
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

  const active = (itemLink, type) => {
    const params = new URLSearchParams(search);
    if (itemLink === "/women")
      return !isMen && ["/", "/women"].includes(pathname);
    if (itemLink === "/men") return isMen && pathname === "/men";
    if (type)
      return pathname === "/slider-shoes" && params.get("type") === type;
    return pathname + search === itemLink;
  };

  const navClass = (isActive) =>
    cls(
      "relative text-sm uppercase tracking-[0.18em] transition after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-neutral-950 after:transition-all",
      isActive
        ? "text-neutral-950 after:w-full"
        : "text-neutral-500 hover:text-neutral-950 after:w-0 hover:after:w-full",
    );

  const SimpleLink = ({ name, to, type, onClick }) => (
    <Link to={to} onClick={onClick} className={navClass(active(to, type))}>
      {name}
    </Link>
  );

  const MobileLink = ({ name, to }) => (
    <Link
      to={to}
      onClick={closeAll}
      className="block border-b px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-700 hover:bg-neutral-50"
    >
      {name}
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link
              to={home}
              className="text-2xl font-semibold uppercase tracking-[0.35em] text-neutral-950"
            >
              Anilox
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {mainLinks.map(([name, to, type]) =>
                name === "Shoes" ? (
                  <div key={name} className="group relative">
                    <div className="flex items-center gap-2">
                      <SimpleLink name={name} to={to} type={type} />
                      <FaCaretDown className="text-xs text-neutral-500 transition group-hover:rotate-180" />
                    </div>

                    <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-4 opacity-0 transition group-hover:visible group-hover:opacity-100">
                      <div className="rounded-2xl border bg-white p-3 shadow-2xl">
                        <p className="px-3 pb-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                          Shop By Type
                        </p>

                        {shoeTypes.map(([label, category]) => (
                          <Link
                            key={category}
                            to={link({ type: "shoe", category })}
                            className="block rounded-xl px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <SimpleLink key={name} name={name} to={to} type={type} />
                ),
              )}

              {user?.role === "admin" && (
                <div className="group relative">
                  <button className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-neutral-500 hover:text-neutral-950">
                    Admin{" "}
                    <FaCaretDown className="text-xs transition group-hover:rotate-180" />
                  </button>

                  <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4 opacity-0 transition group-hover:visible group-hover:opacity-100">
                    <div className="rounded-2xl border bg-white p-3 shadow-2xl">
                      {adminLinks.map(([label, to]) => (
                        <Link
                          key={label}
                          to={to}
                          className="block rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-full border bg-neutral-50 p-1 md:flex">
                {[
                  ["Women", "/women", !isMen],
                  ["Men", "/men", isMen],
                ].map(([name, to, on]) => (
                  <Link
                    key={name}
                    to={to}
                    className={cls(
                      "rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]",
                      on ? "bg-neutral-950 text-white" : "text-neutral-500",
                    )}
                  >
                    {name}
                  </Link>
                ))}
              </div>

              <Link
                to="/basket"
                onClick={handelOrderPopup}
                className="rounded-full border p-3 text-neutral-700 hover:border-neutral-950"
              >
                <FaCartShopping />
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
                      onClick={() => setUserOpen((p) => !p)}
                      className="rounded-full bg-neutral-950 px-5 py-2 text-sm text-white"
                    >
                      {user.name || user.username || "Account"}
                    </button>

                    {userOpen && (
                      <div className="absolute right-0 top-12 w-64 rounded-2xl border bg-white p-3 shadow-2xl">
                        <div className="border-b px-3 pb-3">
                          <p className="font-medium">
                            {user.name || user.username}
                          </p>
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {user.email}
                          </p>
                        </div>

                        <button
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
                    className="rounded-full bg-neutral-950 px-6 py-2 text-sm text-white"
                  >
                    Login
                  </Link>
                )}
              </div>

              <button
                onClick={() => setMobile(true)}
                className="rounded-full border p-3 lg:hidden"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cls(
          "fixed inset-0 z-[9999]",
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
              <h2 className="text-xl font-semibold uppercase tracking-[0.25em]">
                Anilox
              </h2>
            </div>

            <button onClick={closeAll} className="rounded-full border p-3">
              <FaXmark />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b p-4">
            {[
              ["Women", "/women", !isMen],
              ["Men", "/men", isMen],
            ].map(([name, to, on]) => (
              <Link
                key={name}
                to={to}
                onClick={closeAll}
                className={cls(
                  "rounded-full px-4 py-3 text-center text-xs uppercase tracking-[0.16em]",
                  on
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-600",
                )}
              >
                {name}
              </Link>
            ))}
          </div>

          {user && (
            <div className="border-b bg-neutral-50 px-5 py-4">
              <p className="font-medium">{user.name || user.username}</p>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto">
            {mainLinks.map(([name, to]) =>
              name === "Shoes" ? (
                <div key={name} className="border-b">
                  <div className="flex">
                    <Link
                      to={to}
                      onClick={closeAll}
                      className="flex-1 px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-700"
                    >
                      Shoes
                    </Link>

                    <button
                      onClick={() => setShoeOpen((p) => !p)}
                      className="px-5"
                    >
                      <FaCaretDown
                        className={cls("transition", shoeOpen && "rotate-180")}
                      />
                    </button>
                  </div>

                  {shoeOpen && (
                    <div className="bg-neutral-50 px-7 pb-4">
                      {shoeTypes.map(([label, category]) => (
                        <Link
                          key={category}
                          to={link({ type: "shoe", category })}
                          onClick={closeAll}
                          className="block py-2 text-sm text-neutral-600"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <MobileLink key={name} name={name} to={to} />
              ),
            )}

            {user?.role === "admin" && (
              <div className="border-b">
                <button
                  onClick={() => setAdminOpen((p) => !p)}
                  className="flex w-full items-center justify-between px-5 py-4 text-sm uppercase tracking-[0.16em] text-neutral-700"
                >
                  Admin Panel
                  <FaCaretDown
                    className={cls("transition", adminOpen && "rotate-180")}
                  />
                </button>

                {adminOpen && (
                  <div className="bg-neutral-50 py-2">
                    {adminLinks.map(([label, to]) => (
                      <Link
                        key={label}
                        to={to}
                        onClick={closeAll}
                        className="block px-8 py-3 text-sm text-neutral-600"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="border-t p-4">
            {user ? (
              <button
                onClick={() => {
                  closeAll();
                  logout();
                }}
                className="w-full rounded-full border border-red-200 px-5 py-3 text-sm text-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/LoginLogout"
                onClick={closeAll}
                className="block rounded-full bg-neutral-950 px-5 py-3 text-center text-sm text-white"
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
