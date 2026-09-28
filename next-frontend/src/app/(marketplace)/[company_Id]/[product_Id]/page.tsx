"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  ShoppingCart,
  MessageSquare,
  Sliders,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Tag,
  Clock,
  ChevronRight,
  TrendingUp,
  Info,
  Check,
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

export default function ProductDetailPage() {
  const params = useParams();
  const rawCompanyId = (params?.company_Id as string) || "c1";
  const rawProductId = (params?.product_Id as string) || "p1";

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbCompany, setDbCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive state for Quotation section & Options
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [quotationSent, setQuotationSent] = useState(false);

  // Form states for contact section
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Fetch DB data if available
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const prodRes = await api.get<any>(`/products/${rawProductId}`);
        if (isMounted && prodRes) {
          setDbProduct(prodRes);
        }
      } catch (err) {
        console.log("[ProductPage] DB product fetch fallback to sample:", err);
      }

      try {
        const compRes = await api.get<any>(`/company/${rawCompanyId}`);
        if (isMounted && compRes) {
          setDbCompany(compRes);
        }
      } catch (err) {
        console.log("[ProductPage] DB company fetch fallback to sample:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [rawCompanyId, rawProductId]);

  const fallbackData: SampleProduct = getSampleProduct(rawProductId, rawCompanyId);

  // ---------------- Use conditional operator "?" to populate data if available else sample_data
  const productName = dbProduct?.productName ? dbProduct.productName : fallbackData.productName;
  const companyName = dbProduct?.companyName ? dbProduct.companyName : (dbCompany?.companyName ? dbCompany.companyName : fallbackData.companyName);
  const productType = dbProduct?.productType ? dbProduct.productType : fallbackData.productType;
  const typeLabel = dbProduct?.typeLabel ? dbProduct.typeLabel : fallbackData.typeLabel;
  const category = dbProduct?.category ? dbProduct.category : fallbackData.category;
  const pricingText = dbProduct?.pricing ? dbProduct.pricing : fallbackData.pricing;
  const basePrice = dbProduct?.basePrice ? Number(dbProduct.basePrice) : fallbackData.basePrice;
  const availability = dbProduct?.availability ? dbProduct.availability : fallbackData.availability;
  const productDescription = dbProduct?.productDescription ? dbProduct.productDescription : fallbackData.productDescription;
  const location = dbProduct?.location ? dbProduct.location : (dbCompany?.located ? dbCompany.located : fallbackData.location);
  const rating = dbProduct?.rating ? Number(dbProduct.rating) : fallbackData.rating;
  const reviewCount = dbProduct?.reviewCount ? Number(dbProduct.reviewCount) : fallbackData.reviewCount;
  const totalSales = dbProduct?.totalSales ? Number(dbProduct.totalSales) : fallbackData.totalSales;

  // Complex objects using conditional operator "?"
  const tags: string[] = Array.isArray(dbProduct?.tags)
    ? dbProduct.tags
    : fallbackData.tags;

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

  const contactInfo = dbProduct?.contact ? dbProduct.contact : fallbackData.contact;

  const quotationOptions: OptionToggleItem[] =
    Array.isArray(dbProduct?.quotationOptions) && dbProduct.quotationOptions.length > 0
      ? dbProduct.quotationOptions
      : fallbackData.quotationOptions;

  // ---------------- Dynamic Quotation Calculations based on Quantity & Tiers
  const activeTier = useMemo(() => {
    const matched = pricingTiers.find(
      (tier) => quantity >= tier.minQty && quantity <= tier.maxQty
    );
    return matched || pricingTiers[pricingTiers.length - 1] || { pricePerUnit: basePrice, discountLabel: "Standard" };
  }, [quantity, pricingTiers, basePrice]);

  const currentUnitPrice = activeTier.pricePerUnit;
  const baseSubtotal = currentUnitPrice * quantity;

  // Total price of selected toggle options
  const optionsTotal = useMemo(() => {
    return selectedOptionIds.reduce((sum, optId) => {
      const opt = quotationOptions.find((o) => o.id === optId);
      return sum + (opt ? opt.price : 0);
    }, 0);
  }, [selectedOptionIds, quotationOptions]);

  const grandTotal = baseSubtotal + optionsTotal;

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuotationSent(true);
    setTimeout(() => setQuotationSent(false), 5000);
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ---------------- Breadcrumb Navigation ---------------- */}
      <div className="bg-muted/30 border-b border-border py-3 px-6 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:underline">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${rawCompanyId}`} className="hover:underline flex items-center gap-1 font-medium text-foreground">
            <Building2 className="w-3.5 h-3.5" /> {companyName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground line-clamp-1">{productName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* ---------------- 1. Product Details Section & Action Buttons ---------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual & Key Specs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="b2b-card p-6 relative space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                    <Package className="w-3.5 h-3.5" /> {typeLabel}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground font-medium">
                    {category}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{productName}</h1>
                <Link
                  href={`/${rawCompanyId}`}
                  className="text-sm text-primary hover:underline font-medium mt-1 inline-flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" /> Supplied by {companyName}
                </Link>
              </div>

              {/* Rating & Stats Bar */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-y border-border/60 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {rating}
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
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Product Description</h3>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {productDescription}
                </p>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-muted-foreground font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Buy Now / Chat CTA Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="b2b-card p-6 space-y-6 sticky top-6 border-primary/30 shadow-md">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Starting Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">{pricingText}</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <Tag className="w-3.5 h-3.5" /> Volume discounts available in quotation below
                </p>
              </div>

              {/* Availability Section */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-primary" /> Availability &amp; Dispatch
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground">{availability}</p>
              </div>

              {/* Buttons: Buy Now, Chat */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm"
                    onClick={() => setBuyModalOpen(true)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary/30 text-foreground font-semibold text-sm hover:bg-primary/5"
                    onClick={() => setChatModalOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Chat
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => {
                    const el = document.getElementById("quotation-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Sliders className="w-3.5 h-3.5 mr-1.5" /> Calculate Bulk Quotation
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-2 pt-2 border-t border-border/40">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Buyer Protection &amp; Escrow Guarantee
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 2. Quotation Section (Quantity Slider & Option Toggles) ---------------- */}
        <section id="quotation-section" className="b2b-card p-6 sm:p-8 space-y-8 scroll-mt-20 border-primary/40 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sliders className="w-6 h-6 text-primary" /> Instant Quotation Calculator
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Adjust required quantity to unlock tier pricing and select optional add-on features
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Active Tier: {activeTier.discountLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Slider & Options */}
            <div className="lg:col-span-7 space-y-8">
              {/* Quantity Slider */}
              <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> Quantity (Units):
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 text-right font-mono font-bold text-sm h-9"
                    />
                    <span className="text-xs font-medium text-muted-foreground">Units</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex justify-between text-[11px] font-mono text-muted-foreground px-1">
                  <span>1 Unit</span>
                  <span>50 Units</span>
                  <span>200 Units</span>
                  <span>500+ Units</span>
                </div>
              </div>

              {/* Options with Toggle Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Optional Customizations &amp; Services
                </h3>
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
                            : "bg-card border-border hover:border-border/80"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                            {opt.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-foreground">
                            + ₹ {opt.price.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted border-border"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quotation Summary Card */}
            <div className="lg:col-span-5 bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground border-b border-border pb-3">Quotation Summary</h3>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Unit Price ({activeTier.discountLabel}):</span>
                  <span className="font-mono font-medium text-foreground">₹ {currentUnitPrice.toLocaleString()} / unit</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-mono font-medium text-foreground">{quantity} units</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span>Base Subtotal:</span>
                  <span className="font-mono font-bold text-foreground">₹ {baseSubtotal.toLocaleString()}</span>
                </div>
                {optionsTotal > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Optional Services Total:</span>
                    <span className="font-mono">+ ₹ {optionsTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">Estimated Grand Total</span>
                  <span className="text-2xl font-extrabold text-foreground">₹ {grandTotal.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Excl. GST</span>
              </div>

              <Button
                className="w-full font-semibold text-sm mt-2"
                onClick={() => {
                  const el = document.getElementById("contact-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Send className="w-4 h-4 mr-2" /> Request Official Written RFQ
              </Button>
            </div>
          </div>
        </section>

        {/* ---------------- 3. Pricing Tiers Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Volume Pricing Tiers
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Transparent bulk pricing thresholds for commercial orders
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingTiers.map((tier, idx) => {
              const isCurrent = quantity >= tier.minQty && quantity <= tier.maxQty;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-primary/10 border-primary ring-1 ring-primary"
                      : "bg-card border-border"
                  }`}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                    {tier.minQty} - {tier.maxQty} Units
                  </span>
                  <p className="text-xl font-bold text-foreground mt-1 font-mono">
                    ₹ {tier.pricePerUnit.toLocaleString()}
                  </p>
                  <span className="text-xs font-medium text-emerald-600 mt-2 inline-block bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {tier.discountLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- 4. Specs Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Technical Specifications
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed engineering attributes and performance standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            {Object.entries(specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-border/50"
              >
                <span className="text-muted-foreground font-medium">{key}</span>
                <span className="font-semibold text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 5. Past Customers List Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Past Buyers &amp; Client Companies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Companies that have procured this product listing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pastCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-4 rounded-xl bg-card border border-border flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
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
        </section>

        {/* ---------------- 6. Recent 5 Reviews Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Recent Product Reviews (Recent 5)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Feedback from verified industrial customers
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" /> {rating} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < Math.floor(rev.rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-semibold text-foreground ml-1">{rev.rating}</span>
                    </div>
                    {rev.verified && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
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

        {/* ---------------- 7. Contact Section ---------------- */}
        <section id="contact-section" className="b2b-card p-6 space-y-6 scroll-mt-20">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Contact Supplier for {productName}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Submit your RFQ directly to {companyName}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-sm text-foreground">Supplier Desk</h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
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
                  <span>Response Time: <strong className="text-foreground">{contactInfo.responseTime}</strong></span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              {quotationSent ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base">RFQ Sent Successfully!</h3>
                  <p className="text-xs">
                    Your request for {quantity} units of &quot;{productName}&quot; (Est. Total: ₹ {grandTotal.toLocaleString()}) has been transmitted to {companyName}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Your Name</label>
                      <Input
                        required
                        placeholder="Jane Smith"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Work Email</label>
                      <Input
                        required
                        type="email"
                        placeholder="jane@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
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
                  <Button type="submit" className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" /> Send RFQ Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ---------------- Modals for Buy Now & Chat ---------------- */}
      {buyModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="b2b-card max-w-md w-full p-6 space-y-4 shadow-xl border-primary/40">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Purchase Order — {productName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct checkout for {quantity} units with supplier {companyName}.
            </p>
            <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Total:</span>
                <span className="font-bold text-foreground">₹ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setBuyModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => { setBuyModalOpen(false); alert("Purchase order initiated!"); }}>
                Confirm Purchase Order
              </Button>
            </div>
          </div>
        </div>
      )}

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
              <Button variant="outline" size="sm" onClick={() => setChatModalOpen(false)}>
                Close
              </Button>
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
