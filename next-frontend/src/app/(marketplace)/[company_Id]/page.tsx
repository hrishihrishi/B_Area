"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Star,
  Users,
  Calendar,
  Briefcase,
  Send,
  Loader2,
  Package,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api-client";
import {
  getSampleCompany,
  SampleCompany,
  SampleProduct,
  ReviewItem,
  CustomerItem,
} from "@/data/sample/page";
import {
  MapLinkedListingCard,
  ListingCardData,
} from "@/components/modules/storefront/MapLinkedListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TabId = "overview" | "products" | "reviews" | "contact";

export default function CompanyDetailPage() {
  const params = useParams();
  const rawCompanyId = (params?.company_Id as string) || "c1";

  const [dbCompany, setDbCompany] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inquirySent, setInquirySent] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Customer carousel
  const customerScrollRef = useRef<HTMLDivElement>(null);
  const [isCustomerHovered, setIsCustomerHovered] = useState(false);

  useEffect(() => {
    const container = customerScrollRef.current;
    if (!container) return;
    const interval = setInterval(() => {
      if (!isCustomerHovered) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 4) container.scrollLeft = 0;
        else container.scrollLeft += 1;
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isCustomerHovered]);

  const scrollCustomers = (direction: "left" | "right") => {
    if (!customerScrollRef.current) return;
    const container = customerScrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollAmount = 552;
    if (direction === "right") {
      if (container.scrollLeft >= maxScroll - 10)
        container.scrollTo({ left: 0, behavior: "smooth" });
      else container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      if (container.scrollLeft <= 10)
        container.scrollTo({ left: maxScroll, behavior: "smooth" });
      else container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const companyRes = await api.get<any>(`/company/${rawCompanyId}`);
        if (isMounted && companyRes) setDbCompany(companyRes);
      } catch (err) {
        console.log("[CompanyPage] DB company fetch fallback to sample:", err);
      }
      try {
        const productsRes = await api.get<any[]>(
          `/products?companyId=${rawCompanyId}`,
        );
        if (isMounted && Array.isArray(productsRes) && productsRes.length > 0)
          setDbProducts(productsRes);
      } catch (err) {
        console.log("[CompanyPage] DB products fetch fallback to sample:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [rawCompanyId]);

  const fallbackData: SampleCompany = getSampleCompany(rawCompanyId);

  const companyName = dbCompany?.companyName ?? fallbackData.companyName;
  const industry = dbCompany?.industry ?? fallbackData.industry;
  const located = dbCompany?.located ?? fallbackData.located;
  const founder = dbCompany?.founder ?? fallbackData.founder;
  const website = dbCompany?.website ?? fallbackData.website;
  const about = dbCompany?.about ?? fallbackData.about;
  const email = dbCompany?.email ?? fallbackData.email;
  const phone = dbCompany?.phone ?? fallbackData.phone;
  const verificationStatus =
    dbCompany?.verificationStatus ?? fallbackData.verificationStatus;
  const rating = dbCompany?.rating
    ? Number(dbCompany.rating)
    : fallbackData.rating;
  const reviewCount = dbCompany?.reviewCount
    ? Number(dbCompany.reviewCount)
    : fallbackData.reviewCount;
  const establishedYear = dbCompany?.createdAt
    ? new Date(dbCompany.createdAt).getFullYear()
    : fallbackData.establishedYear;

  const customers: CustomerItem[] =
    dbCompany?.customers?.length > 0
      ? dbCompany.customers
      : fallbackData.customers;
  const reviews: ReviewItem[] =
    dbCompany?.reviews?.length > 0
      ? dbCompany.reviews.slice(0, 5)
      : fallbackData.reviews.slice(0, 5);

  const productsList =
    dbProducts?.length > 0 ? dbProducts : fallbackData.products;

  const listingCardsData: ListingCardData[] = productsList.map((p: any) => ({
    id: p.productId || p.id || "p1",
    companyId: p.companyId || rawCompanyId,
    title: p.productName || p.title || "Product Listing",
    companyName: p.companyName || companyName,
    category: p.category || "General Industrial",
    typeLabel: p.productType || p.typeLabel || "Product",
    pricing:
      p.pricing ||
      (p.basePrice ? `₹ ${p.basePrice.toLocaleString()}` : undefined),
    city: p.location || located.split(",")[0],
    score: p.rating ? Number(p.rating) : 4.8,
    tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : ["Verified"],
    verificationStatus,
  }));

  const isVerified = verificationStatus?.toUpperCase() === "VERIFIED";

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  const TABS: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: "overview",
      label: "Overview & About",
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: "products",
      label: "Products & Services",
      icon: <Package className="w-3.5 h-3.5" />,
      count: listingCardsData.length,
    },
    {
      id: "reviews",
      label: "Client Reviews",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      count: reviewCount,
    },
    {
      id: "contact",
      label: "Contact & RFQ",
      icon: <FileText className="w-3.5 h-3.5" />,
    },
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
      {/* ── 1. Hero Storefront Header ── */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Company Identity */}
            <div className="flex items-start gap-5">
              {/* Logo placeholder */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-10 h-10 text-primary" />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {companyName}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-4 h-4" /> {industry}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {located}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Est. {establishedYear}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {rating} ({reviewCount} reviews)
                  </span>
                </div>

                {/* Trust Metrics Bar */}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> GSTIN Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3" /> Avg. Response &lt; 2 hrs
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                    {rating}/5.0 Overall Rating
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Button
                size="lg"
                className="flex-1 md:flex-none font-semibold shadow-sm"
                onClick={() => setActiveTab("contact")}
              >
                <Mail className="w-4 h-4 mr-2" /> Contact Supplier / RFQ
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 md:flex-none"
                onClick={() => setActiveTab("products")}
              >
                <Package className="w-4 h-4 mr-2" /> Browse Catalog (
                {listingCardsData.length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Tab Navigation ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-0 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-4 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* ── Tab: Overview & About ── */}
        {activeTab === "overview" && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 b2b-card p-6 space-y-5">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Building2 className="w-5 h-5 text-primary" /> About{" "}
                  {companyName}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {about}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                      Founder
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {founder}
                    </p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                      Industry
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {industry}
                    </p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                    <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                      Headquarters
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {located}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Snapshot */}
              <div className="b2b-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Supplier
                  Snapshot
                </h2>
                <ul className="space-y-3 text-sm">
                  {[
                    {
                      label: "Verification",
                      value: verificationStatus,
                      highlight: true,
                    },
                    {
                      label: "Overall Rating",
                      value: `${rating} / 5.0`,
                      icon: (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ),
                    },
                    { label: "Website", value: website, link: true },
                    { label: "Direct Email", value: email },
                    { label: "Contact Phone", value: phone },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                    >
                      <span className="text-muted-foreground text-xs">
                        {item.label}
                      </span>
                      {item.link ? (
                        <a
                          href={
                            website?.startsWith("http")
                              ? website
                              : `https://${website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1 line-clamp-1 text-xs"
                        >
                          <Globe className="w-3 h-3 shrink-0" />{" "}
                          {website?.replace(/https?:\/\//, "")}
                        </a>
                      ) : item.highlight ? (
                        <span className="font-semibold text-emerald-600 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.value}
                        </span>
                      ) : (
                        <span className="font-medium text-foreground flex items-center gap-1 text-xs">
                          {item.icon}
                          {item.value}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Enterprise Clients carousel */}
            <section className="b2b-card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Key Enterprise
                  Clients
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Companies that trust {companyName}
                </p>
              </div>
              <div className="relative group flex items-center">
                <button
                  onClick={() => scrollCustomers("left")}
                  className="absolute -left-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all focus:outline-none"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div
                  ref={customerScrollRef}
                  onMouseEnter={() => setIsCustomerHovered(true)}
                  onMouseLeave={() => setIsCustomerHovered(false)}
                  className="flex items-center gap-4 overflow-x-auto scroll-smooth py-2 w-full no-scrollbar"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {customers.map((cust) => (
                    <div
                      key={cust.id}
                      className="w-[260px] shrink-0 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {cust.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {cust.industry}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />{" "}
                          {cust.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollCustomers("right")}
                  className="absolute -right-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all focus:outline-none"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── Tab: Products & Services ── */}
        {activeTab === "products" && (
          <section id="products-section" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" /> Products &
                  Services Catalog
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all {listingCardsData.length} verified listings from{" "}
                  {companyName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listingCardsData.map((cardData) => (
                <MapLinkedListingCard key={cardData.id} data={cardData} />
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Client Reviews ── */}
        {activeTab === "reviews" && (
          <section className="b2b-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" /> Verified
                  Customer Reviews
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Authentic ratings from verified enterprise buyers
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                <Star className="w-4 h-4 fill-amber-500" /> {rating} / 5.0
              </div>
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
                            className={`w-3.5 h-3.5 ${idx < Math.floor(rev.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-foreground ml-1">
                          {rev.rating}
                        </span>
                      </div>
                      {rev.verified && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-border/40 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <p className="font-semibold text-foreground">
                        {rev.reviewerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {rev.role ? `${rev.role} — ` : ""}
                        {rev.companyName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Contact & RFQ ── */}
        {activeTab === "contact" && (
          <section
            id="contact-section"
            className="b2b-card p-6 space-y-6 scroll-mt-20"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Contact {companyName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Send a direct RFQ or message to the sales team
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact info card */}
              <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border">
                <h3 className="font-semibold text-sm text-foreground">
                  Direct Contact Info
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{email}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <a
                      href={
                        website?.startsWith("http")
                          ? website
                          : `https://${website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline line-clamp-1"
                    >
                      {website}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{located}</span>
                  </li>
                </ul>
              </div>

              {/* RFQ Form */}
              <div className="lg:col-span-2">
                {inquirySent ? (
                  <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-base">
                      Inquiry Submitted Successfully!
                    </h3>
                    <p className="text-xs">
                      Your RFQ has been sent to {companyName}. Their team will
                      respond shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">
                          Your Name
                        </label>
                        <Input
                          required
                          placeholder="John Doe"
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">
                          Work Email
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder="john@company.com"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Phone Number
                      </label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Requirement / Message
                      </label>
                      <Textarea
                        required
                        rows={4}
                        placeholder="Specify your required quantity, specifications, timeline..."
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto font-semibold"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send Inquiry
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
