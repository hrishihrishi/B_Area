"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Sliders,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Info,
  Check,
  ZoomIn,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api-client";
import {
  getSampleProduct,
  SampleProduct,
  ReviewItem,
  CustomerItem,
  PricingTierItem,
  OptionToggleItem,
} from "@/data/sample/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Deterministic gradient for image gallery placeholder */
function heroGradient(title: string): string {
  const opts = [
    "from-blue-600/30 via-indigo-500/20 to-violet-600/30",
    "from-emerald-600/30 via-teal-500/20 to-cyan-600/30",
    "from-amber-500/30 via-orange-400/20 to-rose-500/30",
    "from-violet-600/30 via-purple-500/20 to-fuchsia-600/30",
  ];
  return opts[title.charCodeAt(0) % opts.length];
}

export default function ProductDetailPage() {
  const params = useParams();
  const rawCompanyId = (params?.company_Id as string) || "c1";
  const rawProductId = (params?.product_Id as string) || "p1";

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbCompany, setDbCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive state
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [quotationSent, setQuotationSent] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Past customers carousel
  const pastCustomerScrollRef = useRef<HTMLDivElement>(null);
  const [isPastCustomerHovered, setIsPastCustomerHovered] = useState(false);

  useEffect(() => {
    const container = pastCustomerScrollRef.current;
    if (!container) return;
    const interval = setInterval(() => {
      if (!isPastCustomerHovered) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 4) container.scrollLeft = 0;
        else container.scrollLeft += 1;
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isPastCustomerHovered]);

  const scrollPastCustomers = (direction: "left" | "right") => {
    if (!pastCustomerScrollRef.current) return;
    const container = pastCustomerScrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollAmount = 552;
    if (direction === "right") {
      if (container.scrollLeft >= maxScroll - 10) container.scrollTo({ left: 0, behavior: "smooth" });
      else container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      if (container.scrollLeft <= 10) container.scrollTo({ left: maxScroll, behavior: "smooth" });
      else container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const prodRes = await api.get<any>(`/products/${rawProductId}`);
        if (isMounted && prodRes) setDbProduct(prodRes);
      } catch (err) {
        console.log("[ProductPage] DB product fetch fallback to sample:", err);
      }
      try {
        const compRes = await api.get<any>(`/company/${rawCompanyId}`);
        if (isMounted && compRes) setDbCompany(compRes);
      } catch (err) {
        console.log("[ProductPage] DB company fetch fallback to sample:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [rawCompanyId, rawProductId]);

  const fallbackData: SampleProduct = getSampleProduct(rawProductId, rawCompanyId);

  const productName = dbProduct?.productName ?? fallbackData.productName;
  const companyName = dbProduct?.companyName ?? (dbCompany?.companyName ?? fallbackData.companyName);
  const productType = dbProduct?.productType ?? fallbackData.productType;
  const typeLabel = dbProduct?.typeLabel ?? fallbackData.typeLabel;
  const category = dbProduct?.category ?? fallbackData.category;
  const pricingText = dbProduct?.pricing ?? fallbackData.pricing;
  const basePrice = dbProduct?.basePrice ? Number(dbProduct.basePrice) : fallbackData.basePrice;
  const availability = dbProduct?.availability ?? fallbackData.availability;
  const productDescription = dbProduct?.productDescription ?? fallbackData.productDescription;
  const location = dbProduct?.location ?? (dbCompany?.located ?? fallbackData.location);
  const rating = dbProduct?.rating ? Number(dbProduct.rating) : fallbackData.rating;
  const reviewCount = dbProduct?.reviewCount ? Number(dbProduct.reviewCount) : fallbackData.reviewCount;
  const totalSales = dbProduct?.totalSales ? Number(dbProduct.totalSales) : fallbackData.totalSales;

  const tags: string[] = Array.isArray(dbProduct?.tags) ? dbProduct.tags : fallbackData.tags;
  const specifications: Record<string, string> =
    dbProduct?.specifications && typeof dbProduct.specifications === "object"
      ? dbProduct.specifications
      : fallbackData.specifications;
  const pricingTiers: PricingTierItem[] =
    Array.isArray(dbProduct?.pricingTiers) && dbProduct.pricingTiers.length > 0
      ? dbProduct.pricingTiers
      : fallbackData.pricingTiers;
  const reviews: ReviewItem[] =
    Array.isArray(dbProduct?.reviews) && dbProduct.reviews.length > 0
      ? dbProduct.reviews.slice(0, 5)
      : fallbackData.reviews.slice(0, 5);
  const pastCustomers: CustomerItem[] =
    Array.isArray(dbProduct?.pastCustomers) && dbProduct.pastCustomers.length > 0
      ? dbProduct.pastCustomers
      : fallbackData.pastCustomers;
  const contactInfo = dbProduct?.contact ?? fallbackData.contact;
  const quotationOptions: OptionToggleItem[] =
    Array.isArray(dbProduct?.quotationOptions) && dbProduct.quotationOptions.length > 0
      ? dbProduct.quotationOptions
      : fallbackData.quotationOptions;

  // Pricing engine
  const activeTier = useMemo(() => {
    const matched = pricingTiers.find(
      (tier) => quantity >= tier.minQty && quantity <= tier.maxQty
    );
    return matched || pricingTiers[pricingTiers.length - 1] || { pricePerUnit: basePrice, discountLabel: "Standard" };
  }, [quantity, pricingTiers, basePrice]);

  const currentUnitPrice = activeTier.pricePerUnit;
  const baseSubtotal = currentUnitPrice * quantity;

  const optionsTotal = useMemo(() => {
    return selectedOptionIds.reduce((sum, optId) => {
      const opt = quotationOptions.find((o) => o.id === optId);
      return sum + (opt ? opt.price : 0);
    }, 0);
  }, [selectedOptionIds, quotationOptions]);

  const grandTotal = baseSubtotal + optionsTotal;

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuotationSent(true);
    setTimeout(() => setQuotationSent(false), 5000);
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  // Fake gallery thumbnails — using gradient swatches as placeholders
  const gallerySlides = [
    { label: "Main View", gradient: heroGradient(productName) },
    { label: "Detail View", gradient: "from-slate-400/20 via-zinc-300/20 to-gray-400/20" },
    { label: "Dimension", gradient: "from-sky-400/20 via-blue-300/20 to-indigo-400/20" },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ── Breadcrumb ── */}
      <div className="bg-muted/30 border-b border-border py-3 px-6 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/home" className="hover:underline">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${rawCompanyId}`} className="hover:underline flex items-center gap-1 font-medium text-foreground">
            <Building2 className="w-3.5 h-3.5" /> {companyName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground line-clamp-1">{productName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* ── 1. Hero Product Layout — Asymmetric 2-column ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Visuals + Specs */}
          <div className="lg:col-span-7 space-y-6">

            {/* ── Image Gallery ── */}
            <div className="b2b-card overflow-hidden">
              {/* Main image */}
              <div className={`relative h-72 sm:h-80 bg-gradient-to-br ${gallerySlides[activeImageIndex].gradient} flex items-center justify-center`}>
                {/* Verified badge */}
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
                </span>
                {/* Category + Type */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-foreground border border-border/60">
                    <Package className="w-3 h-3 text-primary" /> {typeLabel}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted/80 backdrop-blur border border-border text-muted-foreground font-medium">
                    {category}
                  </span>
                </div>
                {/* Central placeholder icon */}
                <div className="flex flex-col items-center gap-2 text-foreground/20">
                  <Package className="w-20 h-20" />
                  <span className="text-sm font-medium">{gallerySlides[activeImageIndex].label}</span>
                </div>
                {/* Zoom icon */}
                <div className="absolute bottom-4 right-4 p-2 rounded-full bg-background/70 backdrop-blur border border-border text-muted-foreground">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 p-3 bg-muted/20 border-t border-border">
                {gallerySlides.map((slide, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${slide.gradient} border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      activeImageIndex === idx ? "border-primary shadow-sm" : "border-border/50"
                    }`}
                    aria-label={slide.label}
                  >
                    <Package className="w-5 h-5 text-foreground/30" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Product Info Card ── */}
            <div className="b2b-card p-6 space-y-5">
              {/* Title + company link */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {productName}
                </h1>
                <Link
                  href={`/${rawCompanyId}`}
                  className="text-sm text-primary hover:underline font-medium mt-1.5 inline-flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" /> Supplied by {companyName}
                </Link>
              </div>

              {/* Rating + stats bar */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground py-3 border-y border-border/60 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-500" /> {rating}
                  <span className="text-muted-foreground font-normal">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-foreground">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> {totalSales}+ Units Sold
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500" /> {location}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                  Product Description
                </h3>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {productDescription}
                </p>
              </div>

              {/* Highlight chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Technical Specs Matrix ── */}
            <div className="b2b-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <Info className="w-5 h-5 text-primary" /> Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 border-b border-border/40 text-sm">
                    <span className="text-muted-foreground font-medium">{key}</span>
                    <span className="font-semibold text-foreground text-right ml-4">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Procurement Buy Box */}
          <div className="lg:col-span-5">
            <div className="b2b-card p-6 space-y-5 sticky top-6 border-primary/20 shadow-lg">

              {/* Starting Price */}
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Starting Price</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-foreground">{pricingText}</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3" /> Volume discounts unlock below — adjust quantity
                </p>
              </div>

              {/* ── Unified Pricing Engine ── */}
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                {/* Volume tiers compact table */}
                <div className="border-b border-border">
                  <div className="grid grid-cols-3 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase px-4 py-2">
                    <span>Quantity</span>
                    <span className="text-center">Price / Unit</span>
                    <span className="text-right">Discount</span>
                  </div>
                  {pricingTiers.map((tier, idx) => {
                    const isCurrent = quantity >= tier.minQty && quantity <= tier.maxQty;
                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-3 px-4 py-2.5 text-xs border-b border-border/40 last:border-0 transition-colors ${
                          isCurrent ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        <span>{tier.minQty}–{tier.maxQty} units</span>
                        <span className="text-center font-mono">₹ {tier.pricePerUnit.toLocaleString()}</span>
                        <span className="text-right">{isCurrent ? <span className="badge-verified !text-[10px] !py-0">Active</span> : tier.discountLabel}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity input */}
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-primary" /> Quantity (Units)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-right font-mono font-bold text-sm h-8"
                        id="product-quantity-input"
                      />
                      <span className="text-xs text-muted-foreground">Units</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>1</span><span>125</span><span>250</span><span>500+</span>
                  </div>
                </div>

                {/* Quotation summary */}
                <div className="px-4 py-3 bg-card/80 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Unit Price ({activeTier.discountLabel}):</span>
                    <span className="font-mono font-medium text-foreground">₹ {currentUnitPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× {quantity} units</span>
                    <span className="font-mono font-medium text-foreground">₹ {baseSubtotal.toLocaleString()}</span>
                  </div>
                  {optionsTotal > 0 && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>Optional Services:</span>
                      <span className="font-mono">+ ₹ {optionsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between pt-2 border-t border-border mt-1">
                    <span className="font-semibold text-foreground text-sm">Est. Grand Total</span>
                    <span className="text-xl font-extrabold text-foreground font-mono">₹ {grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">Excl. GST & Logistics</p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-xs">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Availability & Dispatch</p>
                  <p className="text-emerald-700">{availability}</p>
                </div>
              </div>

              {/* ── PRIMARY CTA ── */}
              <div className="space-y-2.5">
                <Button
                  size="lg"
                  className="w-full font-semibold text-base shadow-sm"
                  onClick={() => {
                    const el = document.getElementById("contact-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" /> Request Instant Quotation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary/30 text-foreground hover:bg-primary/5"
                  onClick={() => setChatModalOpen(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Chat with Supplier
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-2 pt-1 border-t border-border/40">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Buyer Protection & Escrow Guarantee
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Quotation Options Section ── */}
        {quotationOptions.length > 0 && (
          <section id="quotation-section" className="b2b-card p-6 sm:p-8 space-y-6 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" /> Optional Customizations & Services
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Select add-on features and services</p>
              </div>
              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Active Tier: {activeTier.discountLabel}
              </span>
            </div>

            <div className="space-y-3">
              {quotationOptions.map((opt) => {
                const isSelected = selectedOptionIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-foreground">
                        + ₹ {opt.price.toLocaleString()}
                      </span>
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. Past Buyers & Client Companies ── */}
        <section className="b2b-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Past Buyers & Client Companies
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Companies that have procured this product</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {pastCustomers.length} Verified Clients
            </span>
          </div>

          <div className="relative group flex items-center">
            <button onClick={() => scrollPastCustomers("left")} className="absolute -left-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all" aria-label="Scroll Left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div
              ref={pastCustomerScrollRef}
              onMouseEnter={() => setIsPastCustomerHovered(true)}
              onMouseLeave={() => setIsPastCustomerHovered(false)}
              className="flex items-center gap-4 overflow-x-auto scroll-smooth py-2 w-full no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {pastCustomers.map((cust) => (
                <div key={cust.id} className="w-[220px] shrink-0 p-4 rounded-xl bg-card border border-border hover:border-emerald-300 transition-all flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">{cust.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{cust.industry}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> {cust.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scrollPastCustomers("right")} className="absolute -right-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all" aria-label="Scroll Right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ── 4. Recent Reviews ── */}
        <section className="b2b-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Product Reviews
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Feedback from verified industrial customers</p>
            </div>
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" /> {rating} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.floor(rev.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs font-semibold text-foreground ml-1">{rev.rating}</span>
                    </div>
                    {rev.verified && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="border-t border-border/40 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">{rev.reviewerName}</p>
                    <p className="text-[11px] text-muted-foreground">{rev.role ? `${rev.role} — ` : ""}{rev.companyName}</p>
                  </div>
                  <span className="text-[10px] font-mono">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Contact / RFQ Section ── */}
        <section id="contact-section" className="b2b-card p-6 space-y-6 scroll-mt-20 border-primary/20">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Contact Supplier for {productName}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Submit your RFQ directly to {companyName}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-sm text-foreground">Supplier Desk</h3>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{contactInfo.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{contactInfo.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Avg. Response: <strong className="text-foreground">{contactInfo.responseTime}</strong></span>
                </li>
              </ul>

              {/* Calculated summary preview */}
              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1 text-xs">
                <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Your Quote Summary</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>{quantity} × ₹{currentUnitPrice.toLocaleString()}</span>
                  <span className="font-mono font-bold text-foreground">₹ {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {quotationSent ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base">RFQ Sent Successfully!</h3>
                  <p className="text-xs">Your request for {quantity} units of &quot;{productName}&quot; (Est. Total: ₹ {grandTotal.toLocaleString()}) has been sent to {companyName}.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Your Name</label>
                      <Input required placeholder="Jane Smith" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Work Email</label>
                      <Input required type="email" placeholder="jane@company.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
                    <Input placeholder="+91 98765 43210" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">RFQ Message</label>
                    <Textarea
                      required
                      rows={4}
                      placeholder={`I am interested in procuring ${quantity} units of ${productName}...`}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto font-semibold">
                    <Send className="w-4 h-4 mr-2" /> Send RFQ Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Chat Modal ── */}
      {chatModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="b2b-card max-w-md w-full p-6 space-y-4 shadow-xl border-primary/40">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Live Supplier Chat — {companyName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Connect directly with a sales representative for &quot;{productName}&quot;.
            </p>
            <div className="border border-border rounded-xl p-4 min-h-[120px] bg-muted/20 text-xs text-muted-foreground flex items-center justify-center">
              💬 Representatives are online. Type your inquiry...
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setChatModalOpen(false)}>Close</Button>
              <Button size="sm" onClick={() => { setChatModalOpen(false); alert("Chat initiated with seller!"); }}>
                Start Conversation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
