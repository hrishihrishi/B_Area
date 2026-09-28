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

export default function CompanyDetailPage() {
  const params = useParams();
  const rawCompanyId = (params?.company_Id as string) || "c1";

  const [dbCompany, setDbCompany] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inquirySent, setInquirySent] = useState(false);

  // Form states for contact section
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Customer List horizontal auto-scroll ref & hover state
  const customerScrollRef = useRef<HTMLDivElement>(null);
  const [isCustomerHovered, setIsCustomerHovered] = useState(false);

  useEffect(() => {
    const container = customerScrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (!isCustomerHovered) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 4) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isCustomerHovered]);

  const scrollCustomers = (direction: "left" | "right") => {
    if (!customerScrollRef.current) return;
    const container = customerScrollRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollAmount = 552; // 2 cards (260px * 2 + 16px * 2)

    if (direction === "right") {
      if (container.scrollLeft >= maxScroll - 10) {
        // Wrap back to the first card smoothly
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      if (container.scrollLeft <= 10) {
        // Wrap to the end smoothly
        container.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Fetch DB data if available
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const companyRes = await api.get<any>(`/company/${rawCompanyId}`);
        if (isMounted && companyRes) {
          setDbCompany(companyRes);
        }
      } catch (err) {
        console.log("[CompanyPage] DB company fetch fallback to sample:", err);
      }

      try {
        const productsRes = await api.get<any[]>(`/products?companyId=${rawCompanyId}`);
        if (isMounted && Array.isArray(productsRes) && productsRes.length > 0) {
          setDbProducts(productsRes);
        }
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

  // ---------------- Use conditional operator "?" to populate data if available else sample_data
  const companyName = dbCompany?.companyName ? dbCompany.companyName : fallbackData.companyName;
  const industry = dbCompany?.industry ? dbCompany.industry : fallbackData.industry;
  const located = dbCompany?.located ? dbCompany.located : fallbackData.located;
  const founder = dbCompany?.founder ? dbCompany.founder : fallbackData.founder;
  const website = dbCompany?.website ? dbCompany.website : fallbackData.website;
  const about = dbCompany?.about ? dbCompany.about : fallbackData.about;
  const email = dbCompany?.email ? dbCompany.email : fallbackData.email;
  const phone = dbCompany?.phone ? dbCompany.phone : fallbackData.phone;
  const verificationStatus = dbCompany?.verificationStatus
    ? dbCompany.verificationStatus
    : fallbackData.verificationStatus;
  const rating = dbCompany?.rating ? Number(dbCompany.rating) : fallbackData.rating;
  const reviewCount = dbCompany?.reviewCount ? Number(dbCompany.reviewCount) : fallbackData.reviewCount;
  const establishedYear = dbCompany?.createdAt
    ? new Date(dbCompany.createdAt).getFullYear()
    : fallbackData.establishedYear;

  // Customers & Reviews list using conditional operator "?"
  const customers: CustomerItem[] =
    dbCompany?.customers && dbCompany.customers.length > 0
      ? dbCompany.customers
      : fallbackData.customers;

  const reviews: ReviewItem[] =
    dbCompany?.reviews && dbCompany.reviews.length > 0
      ? dbCompany.reviews.slice(0, 5)
      : fallbackData.reviews.slice(0, 5);

  // Products list using conditional operator "?"
  const productsList =
    dbProducts && dbProducts.length > 0
      ? dbProducts
      : fallbackData.products;

  // Map products to MapLinkedListingCard format
  const listingCardsData: ListingCardData[] = productsList.map((p: any) => ({
    id: p.productId || p.id || "p1",
    companyId: p.companyId || rawCompanyId,
    title: p.productName || p.title || "Product Listing",
    companyName: p.companyName || companyName,
    category: p.category || "General Industrial",
    typeLabel: p.productType || p.typeLabel || "Product",
    pricing: p.pricing || (p.basePrice ? `₹ ${p.basePrice.toLocaleString()}` : undefined),
    city: p.location || located.split(",")[0],
    score: p.rating ? Number(p.rating) : 4.8,
    tags: Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : ["Verified"]),
    verificationStatus: verificationStatus,
  }));

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ---------------- 1. Hero / Header Banner Section ---------------- */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{companyName}</h1>
                {verificationStatus?.toUpperCase() === "VERIFIED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-primary mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {industry}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {located}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Est. {establishedYear}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {rating} ({reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("contact-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Mail className="w-4 h-4 mr-2" /> Contact Supplier
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("products-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Package className="w-4 h-4 mr-2" /> View Products ({listingCardsData.length})
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* ---------------- 2. Company Details Section ---------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 b2b-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="w-5 h-5 text-primary" /> About {companyName}
            </h2>

            {/* TODO(UI): trim it to one line and add a read more button*/}
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {about}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase font-semibold">Founder & Leadership</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{founder}</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase font-semibold">Industry Sector</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{industry}</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase font-semibold">Headquarters</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{located}</p>
              </div>
            </div>
          </div>

          <div className="b2b-card p-6 space-y-4 flex flex-col justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" /> Supplier Snapshot
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Verification</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {verificationStatus}
                </span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Overall Rating</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {rating} / 5.0
                </span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Website</span>
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1 line-clamp-1"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" /> {website.replace(/https?:\/\//, "")}
                </a>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Direct Email</span>
                <span className="font-medium text-foreground">{email}</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Contact Phone</span>
                <span className="font-medium text-foreground">{phone}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------------- 3. All Products Section (4 Column Grid) ---------------- */}
        <section id="products-section" className="space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" /> Products &amp; Services Catalog
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Showing all {listingCardsData.length} verified listings from {companyName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listingCardsData.map((cardData) => (
              <MapLinkedListingCard
                key={cardData.id}
                data={cardData}
              />
            ))}
          </div>
        </section>

        {/* ---------------- 4. Customer List Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Key Enterprise Clients &amp; Buyers
            </h2>
          </div>

          <div className="relative group flex items-center">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCustomers("left")}
              className="absolute -left-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all focus:outline-none"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Horizontal Auto-Scrolling Container */}
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
                    <h3 className="font-semibold text-sm text-foreground">{cust.name}</h3>
                    <p className="text-xs text-muted-foreground">{cust.industry}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> {cust.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCustomers("right")}
              className="absolute -right-3 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md hover:bg-accent text-foreground transition-all focus:outline-none"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ---------------- 5. Recent 5 Reviews Section ---------------- */}
        <section className="b2b-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" /> Verified Customer Reviews (Recent 5)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Authentic ratings and feedback from verified enterprise buyers
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
              <Star className="w-4 h-4 fill-amber-500" /> {rating} / 5.0 Rating
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

        {/* ---------------- 6. Contact Section ---------------- */}
        <section id="contact-section" className="b2b-card p-6 space-y-6 scroll-mt-20">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Contact {companyName}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Send a direct RFQ or message to the sales team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border">
              <h3 className="font-semibold text-sm text-foreground">Direct Contact Info</h3>
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
                    href={website.startsWith("http") ? website : `https://${website}`}
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

            <div className="lg:col-span-2">
              {inquirySent ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base">Inquiry Submitted Successfully!</h3>
                  <p className="text-xs">
                    Your RFQ message has been sent to {companyName}. Their team will respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Your Name</label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Work Email</label>
                      <Input
                        required
                        type="email"
                        placeholder="john@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Requirement / Message</label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Specify your required quantity, specifications, timeline..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" /> Send Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
