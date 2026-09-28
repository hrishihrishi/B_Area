"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Star,
  IndianRupee,
  ShieldCheck,
  MessageSquare,
  FileText,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListingCardData {
  id: string;
  companyId?: string;
  title: string;
  companyName: string;
  category: string;
  typeLabel: string;
  pricing?: string;
  city?: string;
  distanceKm?: number;
  score?: number;
  tags?: string[];
  verificationStatus?: string;
}

interface MapLinkedListingCardProps {
  data: ListingCardData;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect?: () => void;
  onSaveLead?: () => void;
  onRemoveLead?: () => void;
}

/** Deterministic placeholder gradient based on title string */
function cardGradient(title: string): string {
  const gradients = [
    "from-blue-500/20 to-indigo-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-violet-500/20 to-purple-500/20",
    "from-amber-500/20 to-orange-500/20",
    "from-rose-500/20 to-pink-500/20",
    "from-sky-500/20 to-cyan-500/20",
  ];
  const idx = title.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export function MapLinkedListingCard({
  data,
  isSelected = false,
  isSaved = false,
  onSelect,
  onSaveLead,
  onRemoveLead,
}: MapLinkedListingCardProps) {
  const router = useRouter();
  const isVerified = data.verificationStatus?.toUpperCase() === "VERIFIED";
  const gradient = cardGradient(data.title);

  const handleCardClick = () => {
    if (onSelect) onSelect();
    const targetCompanyId = data.companyId || "c1";
    router.push(`/${targetCompanyId}/${data.id}`);
  };

  const handleCTAClick = (e: React.MouseEvent, action: "quote" | "chat") => {
    e.stopPropagation();
    const targetCompanyId = data.companyId || "c1";
    if (action === "quote") router.push(`/${targetCompanyId}/${data.id}`);
    else router.push(`/${targetCompanyId}/${data.id}#contact-section`);
  };

  // Format rating display — only show if ≥ 1 (not a raw relevance score)
  const displayRating = data.score != null && data.score >= 1.0 ? data.score.toFixed(1) : null;

  return (
    <article
      id={`listing-${data.id}`}
      onClick={handleCardClick}
      className={`group bg-card border rounded-xl flex flex-col overflow-hidden cursor-pointer scroll-mt-24 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected
          ? "ring-2 ring-primary border-primary/60 shadow-md"
          : "border-border hover:border-primary/40"
      }`}
    >
      {/* ── Thumbnail Area ── */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 overflow-hidden`}>
        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground border border-border/60">
          <Package className="w-2.5 h-2.5 text-primary" />
          {data.category}
        </span>

        {/* Verified Badge */}
        {isVerified && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 backdrop-blur-sm">
            <ShieldCheck className="w-2.5 h-2.5" />
            Verified
          </span>
        )}

        {/* Central icon placeholder */}
        <Package className="w-12 h-12 text-foreground/10" />
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {data.title}
        </h3>

        {/* Company + Distance row */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 min-w-0">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{data.companyName}</span>
          </span>
          {data.distanceKm != null && (
            <span className="flex items-center gap-0.5 shrink-0 text-rose-500 font-medium">
              <MapPin className="w-3 h-3" />
              {data.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Rating + Price row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {displayRating ? (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              {displayRating}
            </span>
          ) : data.city ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3 text-rose-500" />
              {data.city}
            </span>
          ) : (
            <span />
          )}

          {data.pricing && (
            <span className="flex items-center gap-0.5 font-bold text-foreground text-sm">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
              {data.pricing}
            </span>
          )}
        </div>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons — only when save handlers are present (home feed context) */}
        {(onSaveLead || onRemoveLead) && (
          <div className="mt-auto pt-2.5 grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={(e) => handleCTAClick(e, "quote")}
            >
              <FileText className="w-3 h-3 mr-1" />
              Request Quote
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (isSaved && onRemoveLead) onRemoveLead();
                else if (onSaveLead) onSaveLead();
              }}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
