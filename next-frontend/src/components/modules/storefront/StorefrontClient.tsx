"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  X,
  RefreshCw,
  Target,
  Trash2,
  Pencil,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { api } from "@/lib/api-client";
import { loadSession, saveSession, type BareaSession, type UserIntent } from "@/lib/session";
import {
  addSavedLead,
  listSavedLeads,
  removeSavedLead,
  updateSavedLeadNotes,
  type SavedLead,
} from "@/lib/storefront-leads";
import { DiscoveryMap, type MapListing } from "@/components/modules/storefront/DiscoveryMap";
import {
  MapLinkedListingCard,
  type ListingCardData,
} from "@/components/modules/storefront/MapLinkedListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NearbyItem {
  productId: string;
  productName: string;
  productType?: string;
  category: string;
  pricing?: string;
  tags?: string;
  companyId: string;
  companyName: string;
  verificationStatus?: string;
  storeId?: string;
  storeName?: string;
  city?: string;
  storeLatitude?: number;
  storeLongitude?: number;
  localPrice?: number;
  distanceKm?: number;
  finalRelevanceScore?: number;
}

interface SearchResult {
  resultType: "company" | "product";
  id: string;
  name: string;
  companyName: string;
  category: string;
  meta: string;
  score: number;
}

interface OwnProduct {
  productId: string;
  productName: string;
  category: string;
  pricing?: string;
  availability?: string;
}

const INDUSTRY_SEED: Record<string, string> = {
  it_software: "software SaaS",
  manufacturing: "steel industrial",
  textiles: "textile garment",
  automotive: "automotive parts",
  agriculture: "agriculture supply",
  healthcare: "medical equipment",
};

const INTENT_COPY: Record<UserIntent, { headline: string; sub: string }> = {
  buy: {
    headline: "Procurement matches near you",
    sub: "Discover suppliers ranked from closest to farthest — save leads to track conversions.",
  },
  sell: {
    headline: "Buyers browsing your category",
    sub: "See nearby demand and keep your catalog sharp from your personalized storefront.",
  },
  network: {
    headline: "Partners in your radius",
    sub: "Find verified businesses and products around your primary location.",
  },
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function nearbyToCard(item: NearbyItem): ListingCardData {
  return {
    id: item.productId,
    title: item.productName,
    companyName: item.companyName,
    category: item.category,
    typeLabel: item.productType ?? "Product",
    pricing: item.localPrice != null ? String(item.localPrice) : item.pricing,
    city: item.city,
    distanceKm: item.distanceKm,
    score: item.finalRelevanceScore,
    tags: parseTags(item.tags),
    verificationStatus: item.verificationStatus,
  };
}

function searchToCard(result: SearchResult): ListingCardData {
  return {
    id: result.id,
    title: result.name,
    companyName: result.companyName,
    category: result.category,
    typeLabel: result.resultType === "company" ? "Company" : "Product",
    pricing: result.resultType === "product" ? result.meta : undefined,
    city: result.resultType === "company" ? result.meta : undefined,
    score: result.score,
  };
}

export default function StorefrontClient() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [session, setSession] = useState<BareaSession | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [intent, setIntent] = useState<UserIntent>("buy");

  const [userLat, setUserLat] = useState(12.9716);
  const [userLng, setUserLng] = useState(77.5946);
  const [locating, setLocating] = useState(false);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"nearby" | "search">("nearby");
  const [nearbyItems, setNearbyItems] = useState<NearbyItem[]>([]);
  const [searchItems, setSearchItems] = useState<SearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ownProducts, setOwnProducts] = useState<OwnProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPricing, setEditPricing] = useState("");

  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);

  const refreshSaved = useCallback(() => {
    setSavedLeads(listSavedLeads());
  }, []);

  const savedIds = useMemo(() => new Set(savedLeads.map((l) => l.id)), [savedLeads]);

  useEffect(() => {
    const s = loadSession();
    if (!s?.email) {
      router.replace("/register");
      return;
    }
    setSession(s);
    setIntent(s.intent ?? "buy");
    refreshSaved();
  }, [router, refreshSaved]);

  useEffect(() => {
    if (!session?.email || !session.companyId) return;

    const baseSession: BareaSession = {
      companyId: session.companyId,
      email: session.email,
      companyName: session.companyName,
      intent: session.intent,
      industry: session.industry,
      city: session.city,
      latitude: session.latitude,
      longitude: session.longitude,
    };

    async function hydrateProfile() {
      try {
        const profile = await api.get<Record<string, unknown>>(
          `/company/profile?email=${encodeURIComponent(baseSession.email)}`,
        );
        const stores = await api
          .get<Array<{ latitude?: number; longitude?: number; city?: string }>>(
            `/company/${baseSession.companyId}/stores`,
          )
          .catch(() => []);

        const store = stores[0];
        const lat =
          (store?.latitude as number | undefined) ??
          baseSession.latitude ??
          userLat;
        const lng =
          (store?.longitude as number | undefined) ??
          baseSession.longitude ??
          userLng;

        setUserLat(Number(lat) || 12.9716);
        setUserLng(Number(lng) || 77.5946);

        const industry = (profile.industry as string) ?? baseSession.industry;
        const nextSession: BareaSession = {
          ...baseSession,
          companyName:
            (profile.companyName as string) ?? baseSession.companyName,
          industry,
          city: (profile.located as string) ?? store?.city ?? baseSession.city,
          latitude: Number(lat),
          longitude: Number(lng),
        };
        saveSession(nextSession);
        setSession(nextSession);

        if (industry && INDUSTRY_SEED[industry]) {
          setQuery((prev) => prev || INDUSTRY_SEED[industry]);
        }
      } catch (err) {
        console.warn("[Storefront] profile hydrate failed:", err);
      } finally {
        setProfileReady(true);
      }
    }

    hydrateProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email]);

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMode("nearby");
    try {
      const q = query.trim();
      const params = new URLSearchParams({
        lat: String(userLat),
        lng: String(userLng),
        radiusKm: "100",
        size: "24",
        page: "0",
      });
      if (q) params.set("query", q);

      const res = await api.get<{ content: NearbyItem[] }>(
        `/v1/discovery/nearby?${params.toString()}`,
      );
      const content = res.content ?? [];
      const sorted = [...content].sort(
        (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
      );
      setNearbyItems(sorted);
      setSelectedId(sorted[0]?.productId ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load nearby listings.");
      setNearbyItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, userLat, userLng]);

  const fetchOwnProducts = useCallback(async () => {
    if (!session?.companyId) return;
    try {
      const data = await api.get<OwnProduct[]>(
        `/products?companyId=${session.companyId}`,
      );
      setOwnProducts(data ?? []);
    } catch {
      setOwnProducts([]);
    }
  }, [session?.companyId]);

  useEffect(() => {
    if (!profileReady) return;
    fetchNearby();
    fetchOwnProducts();
  }, [profileReady, fetchNearby, fetchOwnProducts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setMode("search");
      try {
        const data = await api.get<SearchResult[]>(
          `/search?q=${encodeURIComponent(trimmed)}&limit=24`,
        );
        setSearchItems(data ?? []);
        setSelectedId(data[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
        setSearchItems([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const displayCards: ListingCardData[] = useMemo(() => {
    if (mode === "search" && query.trim().length >= 2) {
      return searchItems.map(searchToCard);
    }
    return nearbyItems.map(nearbyToCard);
  }, [mode, query, searchItems, nearbyItems]);

  const mapListings: MapListing[] = useMemo(() => {
    if (mode === "search") {
      return [];
    }
    return nearbyItems
      .filter((i) => i.storeLatitude != null && i.storeLongitude != null)
      .map((i) => ({
        id: i.productId,
        title: i.productName,
        latitude: Number(i.storeLatitude),
        longitude: Number(i.storeLongitude),
        distanceKm: i.distanceKm,
        city: i.city,
      }));
  }, [mode, nearbyItems]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        if (session) {
          saveSession({
            ...session,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
        setLocating(false);
        fetchNearby();
      },
      () => {
        setLocating(false);
        setError("Could not detect location. Using last known coordinates.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const handleSaveLead = (card: ListingCardData) => {
    addSavedLead({
      id: card.id,
      resultType: card.typeLabel === "Company" ? "company" : "product",
      name: card.title,
      companyName: card.companyName,
      category: card.category,
      meta: card.pricing ?? card.city ?? "",
    });
    refreshSaved();
  };

  const startEditProduct = (p: OwnProduct) => {
    setEditingId(p.productId);
    setEditName(p.productName);
    setEditCategory(p.category);
    setEditPricing(p.pricing ?? "");
  };

  const saveProductEdit = async () => {
    if (!editingId || !session?.companyId) return;
    try {
      await api.put(`/products/${editingId}`, {
        companyId: session.companyId,
        productName: editName,
        name: editName,
        category: editCategory,
        pricing: editPricing,
        availability: "AVAILABLE",
      });
      setEditingId(null);
      await fetchOwnProducts();
      await fetchNearby();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Delete this product from your catalog?")) return;
    try {
      await api.delete(`/products/${productId}`);
      await fetchOwnProducts();
      await fetchNearby();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const copy = INTENT_COPY[intent];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-accent inline-flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized storefront
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {session.companyName}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">{copy.headline}</p>
              <p className="text-sm text-muted-foreground/80 mt-1">{copy.sub}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleDetectLocation} disabled={locating}>
                {locating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Target className="w-4 h-4 mr-1" />}
                Use my location
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fetchNearby()}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh nearby
              </Button>
              <Button asChild size="sm">
                <Link href="/my-company/products">Full catalog CRUD</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fuzzy search products & companies..."
              className="pl-12 pr-10 h-12 bg-card border-border rounded-xl shadow-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  fetchNearby();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mode === "search" && query.trim().length >= 2
              ? "Showing fuzzy search results by relevance."
              : "Showing location-ranked listings (closest → farthest)."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
              Loading marketplace feed...
            </div>
          ) : displayCards.length === 0 ? (
            <div className="b2b-card p-10 text-center text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No listings yet. Try another keyword or widen your search radius.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayCards.map((card) => (
                <MapLinkedListingCard
                  key={card.id}
                  data={card}
                  isSelected={selectedId === card.id}
                  isSaved={savedIds.has(card.id)}
                  onSelect={() => {
                    setSelectedId(card.id);
                    document.getElementById(`listing-${card.id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                  onSaveLead={() => handleSaveLead(card)}
                  onRemoveLead={() => {
                    removeSavedLead(card.id);
                    refreshSaved();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-5 space-y-6">
          {mode === "nearby" && (
            <DiscoveryMap
              userLat={userLat}
              userLng={userLng}
              listings={mapListings}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          <section className="b2b-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Saved leads ({savedLeads.length})</h2>
            {savedLeads.length === 0 ? (
              <p className="text-xs text-muted-foreground">Save listings to track conversion opportunities.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {savedLeads.map((lead) => (
                  <li key={lead.id} className="border border-border rounded-lg p-3 bg-muted/20">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">{lead.name}</p>
                        <p className="text-[11px] text-muted-foreground">{lead.companyName} · {lead.category}</p>
                      </div>
                      <button
                        type="button"
                        className="text-destructive text-xs hover:underline shrink-0"
                        onClick={() => {
                          removeSavedLead(lead.id);
                          refreshSaved();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <Textarea
                      className="mt-2 text-xs min-h-[56px]"
                      placeholder="Conversion notes..."
                      defaultValue={lead.notes}
                      onBlur={(e) => {
                        updateSavedLeadNotes(lead.id, e.target.value);
                        refreshSaved();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="b2b-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Your catalog</h2>
              <Link href="/my-company/products" className="text-xs text-primary hover:underline">
                Open manager
              </Link>
            </div>
            {ownProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No products yet. Add items from Manage Products.</p>
            ) : (
              <ul className="space-y-2">
                {ownProducts.slice(0, 6).map((p) => (
                  <li
                    key={p.productId}
                    className="flex items-center justify-between gap-2 border border-border/70 rounded-md px-3 py-2 text-sm"
                  >
                    {editingId === p.productId ? (
                      <div className="flex-1 space-y-2">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-xs" />
                        <div className="flex gap-2">
                          <Input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            value={editPricing}
                            onChange={(e) => setEditPricing(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs" onClick={saveProductEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.productName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {p.category} {p.pricing ? `· ${p.pricing}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                            onClick={() => startEditProduct(p)}
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                            onClick={() => deleteProduct(p.productId)}
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
