"use client";

import React from "react";
import {
  Building2,
  Package,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Star,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListingCardData {
  id: string;
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
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onSaveLead: () => void;
  onRemoveLead: () => void;
}

export function MapLinkedListingCard({
  data,
  isSelected,
  isSaved,
  onSelect,
  onSaveLead,
  onRemoveLead,
}: MapLinkedListingCardProps) {
  const isVerified = data.verificationStatus?.toUpperCase() === "VERIFIED";

  return (
    <article
      id={`listing-${data.id}`}
      onClick={onSelect}
      className={`b2b-card p-4 flex flex-col gap-3 cursor-pointer scroll-mt-24 ${
        isSelected ? "ring-2 ring-primary border-primary/60 shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
            <Package className="w-3.5 h-3.5" />
            {data.typeLabel}
          </span>
          {isVerified && <span className="badge-verified">Verified</span>}
        </div>
        {data.distanceKm != null && (
          <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
            {data.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2">{data.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          {data.companyName}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
          {data.category}
        </span>
        {data.city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {data.city}
          </span>
        )}
        {data.pricing && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
            <IndianRupee className="w-3 h-3" />
            {data.pricing}
          </span>
        )}
        {data.score != null && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono opacity-70">
            <Star className="w-3 h-3" />
            {data.score.toFixed(2)}
          </span>
        )}
      </div>

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-1 mt-auto flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={isSaved ? "secondary" : "default"}
          className="flex-1 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            if (isSaved) onRemoveLead();
            else onSaveLead();
          }}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> Saved lead
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 mr-1" /> Save for conversion
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
