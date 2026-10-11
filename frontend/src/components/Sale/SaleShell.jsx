import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import "../../pages/SaleLanding.css";
import "./SaleStore.css";
import "./SaleTypography.css";

const messages = [
  "FREE NEXT DAY DELIVERY 🚚",
  "✨ 7 DAYS SIZE EXCHANGE",
  "💰 COMPLETE REFUND POLICY",
  "🔄 EASY RETURNS",
  "📞 24/7 CUSTOMER SUPPORT",
];

const SaleShell = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return <div className="ms-page sale-store">
    <div className="ms-ticker ms-ticker--top" aria-label="ANLIOX services"><div className="ms-ticker__track">
      {[0, 1].map((copy) => <div className="ms-ticker__group" aria-hidden={copy === 1} key={copy}>{messages.map((message) => <span key={`${copy}-${message}`}>{message}</span>)}</div>)}
    </div></div>
    <header className="ms-header">
      <button onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
      <Link className="ms-logo" to="/sale">ANLIOX</Link>
      <div><button onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Search /></button><Link to="/sale/basket" aria-label="Bag"><ShoppingBag /></Link></div>
      {searchOpen && <form className="ms-search" action="/sale/products"><Search /><input autoFocus name="search" placeholder="Search sale shoes" /><button type="button" onClick={() => setSearchOpen(false)}><X /></button></form>}
    </header>
    <main className="sale-store__main">{children}</main>
    <footer className="ms-footer"><Link className="ms-logo" to="/sale">ANLIOX</Link><p>Men&apos;s designer footwear in the UAE.</p><div><a href="https://www.instagram.com/anilox.stop" target="_blank" rel="noreferrer">Instagram</a><a href="https://wa.me/971505676523" target="_blank" rel="noreferrer">WhatsApp</a></div><small>© {new Date().getFullYear()} ANLIOX</small></footer>
    <div className={`ms-drawer ${menuOpen ? "open" : ""}`}><button className="ms-drawer__shade" onClick={() => setMenuOpen(false)} aria-label="Close menu" /><aside><button onClick={() => setMenuOpen(false)}><X /></button><Link onClick={() => setMenuOpen(false)} to="/sale">Home</Link><Link onClick={() => setMenuOpen(false)} to="/sale/products">Shop</Link><Link onClick={() => setMenuOpen(false)} to="/sale/basket">Shopping Bag</Link></aside></div>
  </div>;
};

export default SaleShell;
