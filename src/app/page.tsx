"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

/* ── Product Type ─────────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  price: number;
  priceDisplay: string;
  originalPrice?: string;
  rating: number;
  badge: string | null;
  badgeType: "new" | "sale" | null;
  image: string;
  category: string;
  size: string[];
  color: string;
  isAccessory: boolean;
  urgency: string;
  rawSummary: string; // Exact text from shopvibe-content.txt
}

/* ── Products from shopvibe-content.txt ────────────────── */
const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Neon Silk Slip Dress",
    price: 240.0,
    priceDisplay: "$240.00",
    rating: 4.9,
    badge: "New season",
    badgeType: "new",
    image: "/neon-silk-dress.jpg",
    category: "Category",
    size: ["XS", "S", "M"],
    color: "Color",
    isAccessory: false,
    urgency: "Only 3 left in stock",
    rawSummary: "1. Neon Silk Slip Dress. $240.00. Rated 4.9. New season.",
  },
  {
    id: 2,
    name: "Architectural Linen Blazer",
    price: 330.0,
    priceDisplay: "$330.00",
    originalPrice: "$410.00",
    rating: 4.8,
    badge: "On sale",
    badgeType: "sale",
    image: "/linen-blazer.jpg",
    category: "Category",
    size: ["S", "M", "L"],
    color: "Color",
    isAccessory: false,
    urgency: "High demand — Selling fast",
    rawSummary: "2. Architectural Linen Blazer. $330.00. Rated 4.8. On sale.",
  },
  {
    id: 3,
    name: "Artisan Woven Sun Hat",
    price: 185.0,
    priceDisplay: "$185.00",
    rating: 5.0,
    badge: null,
    badgeType: null,
    image: "/sun-hat.jpg",
    category: "Category",
    size: ["One Size"],
    color: "Color",
    isAccessory: true,
    urgency: "Handcrafted summer accessory",
    rawSummary: "3. Artisan Woven Sun Hat. $185.00. Rated 5.0.",
  },
  {
    id: 4,
    name: "Minimalist Leather Sandal",
    price: 310.0,
    priceDisplay: "$310.00",
    rating: 4.7,
    badge: null,
    badgeType: null,
    image: "/leather-sandal.jpg",
    category: "Category",
    size: ["38", "39", "40"],
    color: "Color",
    isAccessory: false,
    urgency: "Limited seasonal drop",
    rawSummary: "4. Minimalist Leather Sandal. $310.00. Rated 4.7.",
  },
];

/* ── Star Rating Component ────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="inline-flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill={i < full ? "#FACC15" : i === full && half ? "url(#star-half-grad)" : "#E5E5E5"}
            className="shrink-0"
          >
            {i === full && half && (
              <defs>
                <linearGradient id="star-half-grad">
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="50%" stopColor="#E5E5E5" />
                </linearGradient>
              </defs>
            )}
            <path d="M10 1.12l2.47 5.01L18 6.9l-4 3.89.94 5.5L10 13.38l-4.94 2.9.94-5.5-4-3.89 5.53-.77L10 1.12z" />
          </svg>
        ))}
      </div>
      <span className="typo-caption font-semibold" style={{ color: "var(--color-text-secondary)" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* ── Main Home Page ───────────────────────────────────── */
export default function Home() {
  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  // Filter State (Category, Size, Color, Price Range)
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter Categories specified in text: Category, Size, Color, Price Range
  const filterKeys = ["Category", "Size", "Color", "Price Range"];

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }

  function toggleFilter(filter: string) {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }

  function clearFilters() {
    setActiveFilters([]);
    showToast("Filters cleared");
  }

  // Filtered Products
  const displayedProducts = useMemo(() => {
    if (activeFilters.length === 0) return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((product) => {
      // If any active filter matches the product's attributes
      return activeFilters.some(
        (f) =>
          product.category === f ||
          product.color === f ||
          (f === "Category" && product.id <= 4) ||
          (f === "Size" && product.size.length > 0) ||
          (f === "Color" && product.color.length > 0) ||
          (f === "Price Range" && product.price > 0)
      );
    });
  }, [activeFilters]);

  // Cart operations
  function addToBag(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsDrawerOpen(true);
    showToast(`Added ${product.name} to bag`);
  }

  function updateQuantity(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  }

  function removeFromBag(id: number) {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast("Item removed from bag");
  }

  function applyPromo(codeToApply?: string) {
    const code = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (code === "SUMMER20") {
      setIsPromoApplied(true);
      setPromoCodeInput("SUMMER20");
      showToast("Code SUMMER20 applied: 20% off summer accessories!");
    } else {
      showToast("Invalid code. Try SUMMER20 for 20% off accessories.");
    }
  }

  function copyCode(code: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    applyPromo(code);
    showToast(`Copied code ${code} to clipboard and applied!`);
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast("ShopVibe link copied to clipboard! Share with a friend.");
  }

  // Cart totals
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // 20% discount on summer accessories
  const discountAmount = isPromoApplied
    ? cart.reduce((sum, item) => {
        return item.product.isAccessory
          ? sum + item.product.price * item.quantity * 0.2
          : sum;
      }, 0)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* ─── NAVIGATION ───────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container-narrow flex items-center justify-between" style={{ height: 64 }}>
          {/* Logo / Brand (Interactive target) */}
          <a
            href="#hero"
            className="typo-subhead flex items-center gap-2 hover:opacity-85 transition-opacity"
            style={{
              color: "var(--color-primary)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
            id="brand-logo"
          >
            SHOPVIBE
          </a>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#collections"
              className="typo-body-sm transition-colors hover:text-[#D946EF]"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Summer Collections
            </a>
            <a
              href="#featured"
              className="typo-body-sm transition-colors hover:text-[#D946EF]"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Featured Pieces
            </a>
            <a
              href="#filters"
              className="typo-body-sm transition-colors hover:text-[#D946EF]"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Shop Your Way
            </a>
            <a
              href="#numbers"
              className="typo-body-sm transition-colors hover:text-[#D946EF]"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Key Numbers
            </a>
            <a
              href="#about"
              className="typo-body-sm transition-colors hover:text-[#D946EF]"
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              Who This Is For
            </a>
          </nav>

          {/* Nav Actions: Cart Drawer Trigger & Shop Now */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="btn btn-ghost btn-sm relative flex items-center gap-2"
              aria-label="Open Shopping Bag"
              id="cart-drawer-trigger"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="hidden sm:inline typo-caption font-bold">Bag</span>
              {totalItemCount > 0 && (
                <span
                  className="inline-flex items-center justify-center text-white typo-overline px-2"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    height: 20,
                    minWidth: 20,
                    fontSize: 11,
                  }}
                >
                  {totalItemCount}
                </span>
              )}
            </button>

            <a href="#featured" className="btn btn-primary btn-sm">
              Shop Now
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ─── 1. HERO BANNER (SHOPVIBE) ────────────────────── */}
        <section
          id="hero"
          className="relative overflow-hidden flex items-center"
          style={{ minHeight: "580px", height: "78vh", maxHeight: "740px" }}
        >
          <Image
            src="/hero-banner.jpg"
            alt="ShopVibe contemporary summer fashion collection editorial"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* High-contrast gradient overlay tuned for effortless readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.55) 55%, rgba(15, 23, 42, 0.2) 100%)",
            }}
          />

          <div className="relative z-10 container-narrow py-12">
            <div style={{ maxWidth: 660 }} className="animate-fade-in-up">
              <span
                className="typo-overline px-3 py-1 inline-block mb-3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "var(--color-secondary)",
                  borderRadius: "var(--radius-sm)",
                  backdropFilter: "blur(4px)",
                }}
              >
                Fashion and lifestyle
              </span>

              <h1 className="typo-display text-white mb-3" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                SHOPVIBE
              </h1>

              <p
                className="typo-body-lg text-white mb-3"
                style={{ opacity: 0.95, fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
              >
                Fashion and lifestyle, curated for the contemporary sun-seeker.
              </p>

              <p
                className="typo-body text-white mb-8"
                style={{ opacity: 0.8, maxWidth: 540, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
              >
                Summer style should be easy to find, easy to love and easy to buy.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#collections" className="btn btn-primary btn-lg shadow-large" id="hero-cta-explore">
                  Explore Collection
                </a>
                <a
                  href="#featured"
                  className="btn btn-secondary btn-lg"
                  style={{
                    borderColor: "#FFFFFF",
                    color: "#FFFFFF",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                  id="hero-cta-featured"
                >
                  Featured Pieces
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. WHO THIS IS FOR ───────────────────────────── */}
        <section id="about" className="section" style={{ backgroundColor: "var(--color-surface)" }}>
          <div className="container-narrow text-center" style={{ maxWidth: 840 }}>
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
            >
              WHO THIS IS FOR
            </span>
            <h2
              className="typo-headline"
              style={{ color: "var(--color-text)", fontWeight: 700, lineHeight: 1.3 }}
            >
              Anyone who wants breathable linens, bold colors and architectural silhouettes for the summer,
              without searching through everything to find them.
            </h2>
          </div>
        </section>

        {/* ─── 3. THE IDEA IN ONE LINE ──────────────────────── */}
        <section
          className="section"
          style={{
            backgroundColor: "var(--color-bg)",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="container-narrow text-center" style={{ maxWidth: 760 }}>
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
            >
              THE IDEA IN ONE LINE
            </span>
            <blockquote
              className="typo-subhead"
              style={{
                color: "var(--color-text)",
                fontStyle: "italic",
                margin: 0,
                fontSize: "26px",
                lineHeight: 1.4,
              }}
            >
              &ldquo;Summer style should be easy to find, easy to love and easy to buy.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* ─── 4. SUMMER COLLECTIONS ────────────────────────── */}
        <section id="collections" className="section" style={{ backgroundColor: "var(--color-surface)" }}>
          <div className="container-narrow">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
              <div
                className="w-full md:w-1/2 relative overflow-hidden shadow-medium"
                style={{ borderRadius: "var(--radius-xl)" }}
              >
                <Image
                  src="/collection-banner.jpg"
                  alt="ShopVibe Summer Collections editorial"
                  width={640}
                  height={427}
                  className="object-cover w-full transition-transform duration-700 hover:scale-105"
                  style={{ aspectRatio: "3/2" }}
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col items-start">
                <span
                  className="typo-overline inline-block mb-3"
                  style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
                >
                  SUMMER COLLECTIONS
                </span>
                <h2 className="typo-headline mb-4" style={{ color: "var(--color-text)" }}>
                  Discover our curated edit of breathable linens and architectural silhouettes designed for the contemporary sun-seeker.
                </h2>
                <a href="#featured" className="btn btn-primary btn-md" id="browse-collections-cta">
                  Browse the Edit
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. SEASONAL REFRESH (Promo Banner) ───────────── */}
        <section
          className="section relative overflow-hidden text-center"
          style={{
            background: "linear-gradient(135deg, #18181B 0%, #2E1065 50%, #0F172A 100%)",
            color: "#FFFFFF",
          }}
        >
          <div className="container-narrow relative z-10" style={{ maxWidth: 740 }}>
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "var(--color-secondary)", letterSpacing: "0.12em" }}
            >
              SEASONAL REFRESH
            </span>

            <h2 className="typo-headline text-white mb-4">
              Limited offer. Enjoy 20% off on all summer accessories.
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <span className="typo-body-lg text-white" style={{ opacity: 0.9 }}>
                Use code
              </span>
              <button
                onClick={() => copyCode("SUMMER20")}
                className="promo-code hover:opacity-90 transition-transform active:scale-95 cursor-pointer"
                title="Click to copy & apply code SUMMER20"
                id="copy-summer20-btn"
              >
                <span>SUMMER20</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <span className="typo-body-lg text-white" style={{ opacity: 0.9 }}>
                at checkout.
              </span>
            </div>

            <div className="flex justify-center">
              <a href="#featured" className="btn btn-primary btn-lg shadow-large" id="shop-accessories-cta">
                Shop Accessories
              </a>
            </div>
          </div>
        </section>

        {/* ─── 6. FEATURED PIECES ───────────────────────────── */}
        <section id="featured" className="section" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="container-narrow">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span
                  className="typo-overline inline-block mb-2"
                  style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
                >
                  FEATURED PIECES
                </span>
                <h2 className="typo-headline" style={{ color: "var(--color-text)" }}>
                  Featured Pieces
                </h2>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="typo-caption" style={{ color: "var(--color-text-secondary)" }}>
                    Filtered by: {activeFilters.join(", ")}
                  </span>
                  <button onClick={clearFilters} className="btn btn-ghost btn-sm" id="reset-filter-tag">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map((p) => (
                <article
                  key={p.id}
                  className="card card-elevated flex flex-col justify-between group"
                  id={`product-card-${p.id}`}
                >
                  <div>
                    {/* Consistent Aspect Ratio 3:4 */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Badges tuned with design tokens */}
                      {p.badge && (
                        <span
                          className={`absolute top-3 left-3 typo-overline px-3 py-1 ${
                            p.badgeType === "new" ? "badge-new" : "badge-sale"
                          }`}
                          style={{ borderRadius: "var(--radius-sm)" }}
                        >
                          {p.badge}
                        </span>
                      )}

                      {/* Urgency cue near visual anchor */}
                      <span
                        className="absolute bottom-2 left-2 typo-caption px-2 py-0.5 text-white"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.65)",
                          backdropFilter: "blur(2px)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 11,
                        }}
                      >
                        {p.urgency}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <h3
                        className="typo-body font-bold mb-1 line-clamp-1"
                        style={{ fontFamily: "var(--font-headline)", color: "var(--color-text)" }}
                      >
                        {p.name}
                      </h3>

                      {/* Pricing with cyan sale styling and strikethrough per Do's and Don'ts */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="typo-body font-extrabold"
                            style={{
                              color: p.badgeType === "sale" ? "var(--color-secondary-hover)" : "var(--color-text)",
                            }}
                          >
                            {p.priceDisplay}
                          </span>
                          {p.originalPrice && (
                            <span
                              className="typo-body-sm line-through"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              {p.originalPrice}
                            </span>
                          )}
                        </div>
                        <StarRating rating={p.rating} />
                      </div>

                      {/* Exact raw item summary line from shopvibe-content.txt */}
                      <p
                        className="typo-caption mb-3"
                        style={{
                          color: "var(--color-text-secondary)",
                          backgroundColor: "var(--color-bg)",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {p.rawSummary}
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA (Add to Bag) most prominent element */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToBag(p)}
                      className="btn btn-primary w-full"
                      id={`add-to-bag-${p.id}`}
                    >
                      Add to Bag
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {displayedProducts.length === 0 && (
              <div
                className="text-center py-12 card p-8"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <p className="typo-body-lg mb-3">No pieces match your selected filter criteria.</p>
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear all to start again
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── 7. SHOP YOUR WAY ─────────────────────────────── */}
        <section id="filters" className="section" style={{ backgroundColor: "var(--color-surface)" }}>
          <div className="container-narrow">
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
            >
              SHOP YOUR WAY
            </span>

            <h2 className="typo-subhead mb-6" style={{ color: "var(--color-text)" }}>
              Refine your selection by Category, Size, Color or Price Range. Clear all to start again.
            </h2>

            {/* Filter Chips for Category, Size, Color, Price Range */}
            <div className="flex flex-wrap items-center gap-3">
              {filterKeys.map((item) => {
                const isSelected = activeFilters.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleFilter(item)}
                    className={`chip ${isSelected ? "chip-selected" : ""}`}
                    id={`filter-chip-${item.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span>{item}</span>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}

              {activeFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                  id="clear-all-filters-btn"
                >
                  Clear all to start again
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── 8. RADIANT SUMMER EDIT '24 ───────────────────── */}
        <section
          className="section relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #D946EF 0%, #A21CAF 45%, #22D3EE 100%)",
            color: "#FFFFFF",
          }}
        >
          <div className="container-narrow text-center relative z-10" style={{ maxWidth: 760 }}>
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "rgba(255, 255, 255, 0.8)", letterSpacing: "0.12em" }}
            >
              RADIANT SUMMER EDIT &apos;24
            </span>

            <h2 className="typo-display text-white mb-4" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              Radiant Summer Edit &apos;24
            </h2>

            <p className="typo-body-lg text-white mb-8" style={{ opacity: 0.95, fontWeight: 500 }}>
              Limited drop. Explosive colors meet architectural silhouettes.
            </p>

            <a
              href="#featured"
              className="btn btn-lg shadow-large"
              style={{
                backgroundColor: "#FFFFFF",
                color: "var(--color-primary)",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
              }}
              id="radiant-edit-cta"
            >
              Shop the Edit
            </a>
          </div>

          {/* Decorative ambient glass circles */}
          <div
            className="absolute -top-24 -right-24 rounded-full opacity-20 pointer-events-none"
            style={{ width: 340, height: 340, backgroundColor: "var(--color-tertiary)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 rounded-full opacity-15 pointer-events-none"
            style={{ width: 280, height: 280, backgroundColor: "#FFFFFF" }}
          />
        </section>

        {/* ─── 9. KEY NUMBERS FOR THE PAGE ──────────────────── */}
        <section id="numbers" className="section" style={{ backgroundColor: "var(--color-surface)" }}>
          <div className="container-narrow">
            <div className="text-center mb-8">
              <span
                className="typo-overline inline-block mb-2"
                style={{ color: "var(--color-text-secondary)", letterSpacing: "0.12em" }}
              >
                KEY NUMBERS FOR THE PAGE
              </span>
              <h2 className="typo-headline" style={{ color: "var(--color-text)" }}>
                Key Numbers for the Page
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div
                className="p-8 text-center card card-elevated"
                style={{ borderRadius: "var(--radius-xl)" }}
              >
                <div
                  className="typo-display mb-2"
                  style={{
                    background: "linear-gradient(135deg, #D946EF 0%, #22D3EE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  20%
                </div>
                <p className="typo-body font-semibold" style={{ color: "var(--color-text)" }}>
                  20% off all summer accessories.
                </p>
              </div>

              {/* Stat 2 */}
              <div
                className="p-8 text-center card card-elevated"
                style={{ borderRadius: "var(--radius-xl)" }}
              >
                <div
                  className="typo-display mb-2"
                  style={{
                    background: "linear-gradient(135deg, #D946EF 0%, #22D3EE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  4
                </div>
                <p className="typo-body font-semibold" style={{ color: "var(--color-text)" }}>
                  4 featured pieces.
                </p>
              </div>

              {/* Stat 3 */}
              <div
                className="p-8 text-center card card-elevated"
                style={{ borderRadius: "var(--radius-xl)" }}
              >
                <div
                  className="typo-display mb-2"
                  style={{
                    background: "linear-gradient(135deg, #D946EF 0%, #22D3EE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  1
                </div>
                <p className="typo-body font-semibold" style={{ color: "var(--color-text)" }}>
                  1 code to remember: SUMMER20.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. CALL TO ACTION ───────────────────────────── */}
        <section
          className="section text-center"
          style={{
            backgroundColor: "var(--color-text)",
            color: "#FFFFFF",
          }}
        >
          <div className="container-narrow" style={{ maxWidth: 700 }}>
            <span
              className="typo-overline inline-block mb-3"
              style={{ color: "var(--color-secondary)", letterSpacing: "0.12em" }}
            >
              CALL TO ACTION
            </span>

            <h2 className="typo-headline text-white mb-3">
              Explore the collection and find your summer look.
            </h2>

            <p className="typo-body-lg mb-8" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
              Share it with a friend who loves to dress well.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#collections" className="btn btn-primary btn-lg shadow-large" id="cta-explore-collection">
                Explore Collection
              </a>
              <button
                onClick={handleShare}
                className="btn btn-secondary btn-lg"
                style={{ borderColor: "#FFFFFF", color: "#FFFFFF" }}
                id="cta-share-friend"
              >
                Share with a Friend
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 11. FOOTER NOTE ──────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#0F172A",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.6)",
        }}
        className="py-10"
      >
        <div className="container-narrow text-center" style={{ maxWidth: 800 }}>
          <span
            className="typo-subhead text-white block mb-3"
            style={{ fontWeight: 800, color: "var(--color-primary)", letterSpacing: "0.04em" }}
          >
            SHOPVIBE
          </span>

          <span
            className="typo-overline inline-block mb-2"
            style={{ color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.1em" }}
          >
            FOOTER NOTE
          </span>

          <p className="typo-body-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            ShopVibe is a demo storefront made for a class project. Products, prices and the discount code are examples only.
          </p>
        </div>
      </footer>

      {/* ─── CART DRAWER (Accessible from every view) ─────── */}
      {isDrawerOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className="cart-drawer"
        style={{
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
        }}
        aria-label="Shopping Bag Drawer"
      >
        {/* Drawer Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <h2 className="typo-subhead" style={{ color: "var(--color-text)" }}>
              Shopping Bag
            </h2>
            <span className="typo-caption font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5]">
              {totalItemCount}
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="btn btn-ghost btn-sm p-1"
            aria-label="Close Shopping Bag"
            id="close-cart-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body: Cart items list */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="1.5"
                className="mx-auto mb-3"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="typo-body text-text-secondary mb-4">Your bag is empty.</p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-4"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <div
                    className="relative overflow-hidden shrink-0"
                    style={{ width: 72, height: 96, borderRadius: "var(--radius-md)" }}
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="typo-body font-bold text-sm" style={{ color: "var(--color-text)" }}>
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromBag(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      <p className="typo-caption text-text-secondary mt-0.5">
                        {item.product.priceDisplay} each
                        {item.product.isAccessory && isPromoApplied && (
                          <span className="text-green-600 font-bold ml-2">-20% applied</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center typo-caption font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="typo-body font-extrabold text-sm" style={{ color: "var(--color-text)" }}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div
            className="p-5"
            style={{
              backgroundColor: "var(--color-bg)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {/* Promo Code Input */}
            <div className="mb-4">
              <label htmlFor="promo-input" className="typo-caption font-bold block mb-1">
                Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="input-text typo-code uppercase"
                  style={{ height: 40 }}
                />
                <button
                  onClick={() => applyPromo()}
                  className="btn btn-secondary btn-sm"
                  style={{ height: 40 }}
                >
                  Apply
                </button>
              </div>
              {isPromoApplied && (
                <span className="typo-caption text-green-600 font-bold mt-1 inline-block">
                  ✓ SUMMER20 applied (20% off summer accessories)
                </span>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 mb-4 text-sm">
              <div className="flex justify-between typo-body-sm text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {isPromoApplied && discountAmount > 0 && (
                <div className="flex justify-between typo-body-sm text-green-600 font-bold">
                  <span>Accessories Discount (20%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div
                className="flex justify-between typo-body font-bold text-base pt-2"
                style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text)" }}
              >
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast("Order simulated! Thank you for testing ShopVibe.");
                setCart([]);
                setIsDrawerOpen(false);
              }}
              className="btn btn-primary w-full btn-lg"
              id="checkout-btn"
            >
              Checkout (${finalTotal.toFixed(2)})
            </button>
          </div>
        )}
      </aside>

      {/* ─── TOAST NOTIFICATION ───────────────────────────── */}
      {toastMessage && (
        <div className="toast typo-body-sm" role="status" aria-live="polite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
