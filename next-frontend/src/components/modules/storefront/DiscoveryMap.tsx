"use client";

import React, { useMemo } from "react";
import { MapPin, Navigation, Crosshair } from "lucide-react";

export interface MapListing {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  city?: string;
}

interface DiscoveryMapProps {
  userLat: number;
  userLng: number;
  listings: MapListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function projectToPercent(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): { x: number; y: number } {
  const latSpan = bounds.maxLat - bounds.minLat || 0.01;
  const lngSpan = bounds.maxLng - bounds.minLng || 0.01;
  const x = ((lng - bounds.minLng) / lngSpan) * 100;
  const y = 100 - ((lat - bounds.minLat) / latSpan) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(96, Math.max(4, y)) };
}

export function DiscoveryMap({
  userLat,
  userLng,
  listings,
  selectedId,
  onSelect,
}: DiscoveryMapProps) {
  const bounds = useMemo(() => {
    const lats = [userLat, ...listings.map((l) => l.latitude)];
    const lngs = [userLng, ...listings.map((l) => l.longitude)];
    const pad = 0.08;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [userLat, userLng, listings]);

  const userPos = projectToPercent(userLat, userLng, bounds);

  return (
    <div className="b2b-card overflow-hidden flex flex-col h-full min-h-[320px]">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Nearby map
        </div>
        <span className="text-[11px] text-muted-foreground">
          {listings.length} pin{listings.length === 1 ? "" : "s"} · closest first
        </span>
      </div>

      <div className="relative flex-1 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:24px_24px] bg-muted/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* User location */}
        <button
          type="button"
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
          title="Your location"
        >
          <span className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-primary/20 animate-ping" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md border-2 border-background">
            <Crosshair className="w-4 h-4" />
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded-md bg-card border border-border px-2 py-0.5 text-[10px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            You
          </span>
        </button>

        {listings.map((listing) => {
          const pos = projectToPercent(listing.latitude, listing.longitude, bounds);
          const isSelected = selectedId === listing.id;
          return (
            <button
              key={listing.id}
              type="button"
              onClick={() => onSelect(listing.id)}
              className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-transform duration-150 ${
                isSelected ? "scale-110 z-30" : "hover:scale-105"
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={listing.title}
            >
              <span
                className={`flex flex-col items-center gap-0.5 max-w-[120px] ${
                  isSelected ? "" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md ${
                    isSelected
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-primary border-primary/40"
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border truncate max-w-full ${
                    isSelected
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "bg-card/90 text-foreground border-border"
                  }`}
                >
                  {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km` : listing.city ?? "Listing"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
