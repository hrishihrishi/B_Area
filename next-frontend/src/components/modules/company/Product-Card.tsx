/**
 * Card for each product or services
 * image
 * title
 * type: dropdown(product, service, sell business, saas, rentals)
 * category
 * available locations []
 * features []
 */

// src/components/product-card.tsx
import React from "react";
import Image from "next/image";
import {
  MapPin,
  Tag,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  Sparkles,
  Layers,
  KeyRound,
} from "lucide-react";

export type ListingType =
  | "product"
  | "service"
  | "sell business"
  | "saas"
  | "rentals";

export interface ProductCardProps {
  id?: string;
  title: string;
  image: string;
  type: ListingType;
  category: string;
  locations: string[];
  features: string[];
  price?: string;
  companyName?: string;
  onInquire?: (id?: string) => void;
}

const TYPE_CONFIG: Record<
  ListingType,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  product: {
    label: "Product",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Tag,
  },
  service: {
    label: "Service",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  "sell business": {
    label: "Business for Sale",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Building2,
  },
  saas: {
    label: "SaaS",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: Sparkles,
  },
  rentals: {
    label: "Rental",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: KeyRound,
  },
};

export function ProductCard({
  id,
  title,
  image,
  type,
  category,
  locations = [],
  features = [],
  price,
  companyName,
  onInquire,
}: ProductCardProps) {
  const currentType = TYPE_CONFIG[type] || TYPE_CONFIG.product;
  const TypeIcon = currentType.icon;

  const displayLocations = locations.slice(0, 2);
  const remainingLocations = locations.length - 2;

  const displayFeatures = features.slice(0, 3);
  const remainingFeatures = features.length - 3;

  return (
    <div className="group b2b-card flex flex-col justify-between overflow-hidden bg-card border border-border rounded-xl transition-all duration-300 hover:shadow-lg hover:border-primary/40">
      <div>
        {/* Image & Type Overlay Header */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={image || "/placeholder-listing.png"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

          {/* Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md border ${currentType.badgeClass}`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {currentType.label}
            </span>
          </div>

          {/* Price tag pill (if supplied) */}
          {price && (
            <div className="absolute bottom-3 right-3 z-10 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-border/80 text-xs font-bold text-foreground shadow-sm">
              {price}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3.5">
          {/* Category & Provider */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1 truncate max-w-[60%]">
              <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{category}</span>
            </span>
            {companyName && (
              <span className="truncate max-w-[40%] font-semibold text-foreground/80 text-right">
                {companyName}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Features Highlights */}
          {features.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {displayFeatures.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/70 text-foreground/80 px-2 py-0.5 rounded-md border border-border/50"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate max-w-[120px]">{feature}</span>
                  </span>
                ))}
                {remainingFeatures > 0 && (
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                    +{remainingFeatures} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Available Locations */}
          {locations.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">
                {displayLocations.join(", ")}
                {remainingLocations > 0 && ` +${remainingLocations} cities`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={() => onInquire?.(id)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-secondary/20 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 transition-all duration-200"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}