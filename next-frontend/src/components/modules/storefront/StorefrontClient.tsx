"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  X,
  Briefcase,
  MapPin,
  Target,
  BookmarkCheck,
  Bookmark,
  ChevronRight,
  Package,
  Sparkles,
  Pencil,
  Trash2,
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
    sub: "Suppliers ranked closest → farthest. Save leads to track conversion.",
  },
  sell: {
    headline: "Buyers browsing your category",
    sub: "See nearby demand and keep your catalog sharp.",
  },
  network: {
    headline: "Partners in your radius",
    sub: "Find verified businesses and products around your primary location.",
  },
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

function nearbyToCard(item: NearbyItem): ListingCardData {
  return {
    id: item.productId,
    companyId: item.companyId,
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

/** Skeleton card shown while loading */
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded mt-3" />
      </div>
    </div>
  );
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
  const [sidebarTab, setSidebarTab] = useState<"shortlist" | "catalog">("shortlist");

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
          companyName: (profile.companyName as string) ?? baseSession.companyName,
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
      const data = await api.get<OwnProduct[]>(`/products?companyId=${session.companyId}`);
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
    if (mode === "search") return [];
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
      {/* ── Hero / Search Header ── */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Unified Search Bar with location pill */}
          <div className="relative max-w-7xl flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, companies, categories..."
                className="pl-14 pr-12 h-16 bg-card border-2 border-border focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 rounded-2xl shadow-md hover:shadow-lg transition-all text-base sm:text-lg"
                id="home-search-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); fetchNearby(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Location pill integrated into search row */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="flex items-center gap-2 h-16 px-5 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-sm sm:text-base font-semibold text-foreground transition-all shrink-0 shadow-md disabled:opacity-60"
              title="Use my current location"
            >
              {locating ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Target className="w-5 h-5 text-primary" />
              )}
              <span className="hidden sm:inline">
                {locating ? "Locating..." : "Use Location"}
              </span>
            </button>
          </div>

          <p className="pl-1 text-xs text-muted-foreground mt-2">
            {mode === "search" && query.trim().length >= 2
              ? `Showing fuzzy search results for "${query.trim()}"`
              : "Showing location-ranked listings · closest → farthest"}
          </p>
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── Feed Column ── */}
        <div className="xl:col-span-7 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Results header */}
          {!loading && displayCards.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {displayCards.length} listings found
              </p>
              <Link
                href="/my-company/products"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Package className="w-3.5 h-3.5" />
                Manage Catalog
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Skeleton or real grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayCards.length === 0 ? (
            <div className="b2b-card p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Briefcase className="w-10 h-10 opacity-25" />
              <p className="font-medium">No listings found</p>
              <p className="text-xs max-w-xs">
                Try a different keyword or click &ldquo;Use Location&rdquo; to discover suppliers near you.
              </p>
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

        {/* ── Right Sidebar ── */}
        <div className="xl:col-span-5 space-y-6">
          {/* Map */}
          {mode === "nearby" && (
            <DiscoveryMap
              userLat={userLat}
              userLng={userLng}
              listings={mapListings}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {/* Sidebar tab switcher */}
          <div className="b2b-card overflow-hidden">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setSidebarTab("shortlist")}
                className={`flex-1 px-4 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sidebarTab === "shortlist"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                Shortlisted Vendors ({savedLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("catalog")}
                className={`flex-1 px-4 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sidebarTab === "catalog"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Your Catalog ({ownProducts.length})
              </button>
            </div>

            {/* Shortlist panel */}
            {sidebarTab === "shortlist" && (
              <div className="p-4">
                {savedLeads.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center gap-2 text-muted-foreground">
                    <Bookmark className="w-8 h-8 opacity-30" />
                    <p className="text-xs">No saved leads yet.</p>
                    <p className="text-[11px]">Save listings from the feed to track conversion opportunities.</p>
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {savedLeads.map((lead) => (
                      <li key={lead.id} className="border border-border rounded-lg p-3 bg-muted/20 space-y-2">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">{lead.name}</p>
                            <p className="text-[11px] text-muted-foreground">{lead.companyName} · {lead.category}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => router.push(`/${lead.id}`)}
                              className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-medium"
                            >
                              Contact
                            </button>
                            <button
                              type="button"
                              className="text-[10px] px-2 py-1 rounded hover:bg-destructive/10 text-destructive border border-destructive/20"
                              onClick={() => { removeSavedLead(lead.id); refreshSaved(); }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <Textarea
                          className="text-xs min-h-[44px]"
                          placeholder="Conversion notes..."
                          defaultValue={lead.notes}
                          onBlur={(e) => { updateSavedLeadNotes(lead.id, e.target.value); refreshSaved(); }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Catalog panel */}
            {sidebarTab === "catalog" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">Your active product listings</p>
                  <Link href="/my-company/products" className="text-xs text-primary hover:underline font-medium">
                    + Add Product
                  </Link>
                </div>
                {ownProducts.length === 0 ? (
                  <div className="py-6 text-center flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="w-8 h-8 opacity-30" />
                    <p className="text-xs">No products yet.</p>
                    <Link href="/my-company/products" className="text-xs text-primary hover:underline">
                      Add your first product →
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {ownProducts.slice(0, 8).map((p) => (
                      <li
                        key={p.productId}
                        className="flex items-center justify-between gap-2 border border-border/70 rounded-md px-3 py-2 text-sm"
                      >
                        {editingId === p.productId ? (
                          <div className="flex-1 space-y-2">
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-xs" />
                            <div className="flex gap-2">
                              <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="h-8 text-xs" />
                              <Input value={editPricing} onChange={(e) => setEditPricing(e.target.value)} className="h-8 text-xs" />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs" onClick={saveProductEdit}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="font-medium truncate text-xs">{p.productName}</p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {p.category}{p.pricing ? ` · ${p.pricing}` : ""}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                                onClick={() => startEditProduct(p)}
                                aria-label="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                                onClick={() => deleteProduct(p.productId)}
                                aria-label="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quick RFQ Guide */}
          <div className="b2b-card p-4 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Location-Ranked Discovery</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Listings are ranked by proximity from your registered store coordinates. Click &ldquo;Use Location&rdquo; to update your position.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
