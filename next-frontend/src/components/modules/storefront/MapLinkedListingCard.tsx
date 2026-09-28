"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

  const handleCardClick = () => {
    if (onSelect) onSelect();
    const targetCompanyId = data.companyId || "c1";
    router.push(`/${targetCompanyId}/${data.id}`);
  };

  return (
    <article
      id={`listing-${data.id}`}
      onClick={handleCardClick}
      className={`b2b-card p-4 flex flex-col gap-3 cursor-pointer scroll-mt-24 hover:border-primary/50 transition-all ${
        isSelected ? "ring-2 ring-primary border-primary/60 shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
            <Package className="w-3.5 h-3.5" />
            {data.typeLabel}
          </span> */}
        </div>
        {data.distanceKm != null && (
          <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
            {data.distanceKm.toFixed(1)} km
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2">{data.title}</h3>
        

      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {/* <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
          {data.category}
        </span> */}
                {data.score != null && (
          <span className="inline-flex items-center gap-0.5 text-[20px] font-mono text-black">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {data.score.toFixed(2)}
          </span>
        )}
       
        {data.pricing && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
            <IndianRupee className="w-3 h-3" />
            {data.pricing}
          </span>
        )}

         {data.city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {data.city}
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
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          {data.companyName} {isVerified && <span className="badge-verified">Verified</span>}
        </p>

      {(onSaveLead || onRemoveLead) && (
        <div className="pt-1 mt-auto flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={isSaved ? "secondary" : "default"}
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (isSaved && onRemoveLead) onRemoveLead();
              else if (onSaveLead) onSaveLead();
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
      )}
    </article>
  );
}
