/**
 * Product Catalog Page — /my-company/products
 *
 * Rich product creation modal with metadata specs builder, tags builder,
 * tiered pricing engine, and multi-store inventory mapping checklist.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Package, IndianRupee, Trash2, Loader2, MapPin, Tag, Sliders, Layers } from "lucide-react";

import { api } from "@/lib/api-client";

// ------------------------------------------------------------------ Types

interface StoreBranch {
  storeId: string;
  storeName: string;
  city: string;
}

interface SpecificationPair {
  key: string;
  value: string;
}

interface PricingTier {
  minQty: number;
  maxQty: number;
  price: number;
  unit: string;
}

interface Product {
  productId: string;
  companyId: string;
  productName: string;
  productType?: string;
  type?: string;
  category: string;
  pricing?: string;
  availability: string;
  productDescription?: string;
  tags?: string[];
  specifications?: string | Record<string, string>;
  pricingTiers?: string | PricingTier[];
}

interface Toast {
  type: "success" | "error";
  message: string;
}

function loadSession(): { companyId: string; email: string; companyName?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Core Form state
  const [formData, setFormData] = useState({
    name: "",
    productType: "Product",
    category: "Raw Materials",
    pricingMode: "Fixed", // "Fixed" | "RFQ" | "Tiered"
    fixedPrice: "",
    description: "",
    localPrice: "1000",
    stockQuantity: "100",
  });

  // Dynamic Builders state
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Steel", "B2B", "Wholesale"]);

  const [specs, setSpecs] = useState<SpecificationPair[]>([
    { key: "Material", value: "High Grade Steel" },
    { key: "Origin", value: "India" },
  ]);

  const [tiers, setTiers] = useState<PricingTier[]>([
    { minQty: 1, maxQty: 10, price: 3000, unit: "ton" },
    { minQty: 11, maxQty: 50, price: 2700, unit: "ton" },
  ]);

  // Selected store branch inventory mapping checklist
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);

  function showToast(type: Toast["type"], message: string) {
    console.log("[ProductsPage] Toast:", type, message);
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // ---------------------------------------------------------- Fetch products & stores
  async function fetchData() {
    const session = loadSession();
    if (!session) {
      console.warn("[ProductsPage] No session found.");
      setIsLoading(false);
      return;
    }

    console.log("[ProductsPage] Fetching data for companyId:", session.companyId);
    try {
      const [prodsData, storesData] = await Promise.all([
        api.get<Product[]>(`/products?companyId=${session.companyId}`),
        api.get<StoreBranch[]>(`/company/${session.companyId}/stores`).catch(() => []),
      ]);

      console.log("[ProductsPage] Products count:", prodsData.length, "Stores count:", storesData.length);
      setProducts(prodsData ?? []);
      setStores(storesData ?? []);

      // Default all existing store branch IDs as checked
      if (storesData && storesData.length > 0) {
        setSelectedStoreIds(storesData.map((s) => s.storeId));
      }
    } catch (err) {
      console.error("[ProductsPage] Failed to fetch catalog data:", err);
      showToast("error", "Could not load products. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------------------- Tag builder handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // ---------------------------------------------------------- Spec builder handlers
  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const copy = [...specs];
    copy[index][field] = val;
    setSpecs(copy);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------- Pricing tier handlers
  const handleAddTier = () => {
    const lastMax = tiers.length > 0 ? tiers[tiers.length - 1].maxQty : 0;
    setTiers([...tiers, { minQty: lastMax + 1, maxQty: lastMax + 20, price: 1000, unit: "unit" }]);
  };

  const handleTierChange = (index: number, field: keyof PricingTier, val: any) => {
    const copy = [...tiers];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (copy[index] as any)[field] = val;
    setTiers(copy);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------- Toggle Store Checklist
  const handleToggleStore = (storeId: string) => {
    if (selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds(selectedStoreIds.filter((id) => id !== storeId));
    } else {
      setSelectedStoreIds([...selectedStoreIds, storeId]);
    }
  };

  // ---------------------------------------------------------- Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const session = loadSession();
    if (!session) {
      showToast("error", "Session not found.");
      setIsSubmitting(false);
      return;
    }

    // Convert specs array to object
    const specMap: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specMap[s.key.trim()] = s.value.trim();
    });

    // Build pricing string summary
    let pricingStr = formData.fixedPrice || "Contact for Quote";
    if (formData.pricingMode === "RFQ") {
      pricingStr = "RFQ (Request for Quote)";
    } else if (formData.pricingMode === "Tiered" && tiers.length > 0) {
      pricingStr = `Tiered from ₹${tiers[0].price}/${tiers[0].unit}`;
    }

    const payload = {
      companyId:          session.companyId,
      companyName:        session.companyName || session.email,
      productName:        formData.name,
      productType:        formData.productType,
      type:               formData.productType,
      category:           formData.category,
      pricing:            pricingStr,
      productDescription: formData.description,
      availability:       "AVAILABLE",
      tags:               tags,
      specifications:     specMap,
      pricing_tiers:      formData.pricingMode === "Tiered" ? tiers : [],
      storeIds:           selectedStoreIds,
      localPrice:         parseFloat(formData.localPrice) || 1000,
      stockQuantity:      parseInt(formData.stockQuantity) || 100,
    };

    console.log("[ProductsPage] Submitting POST /products payload:", payload);

    try {
      await api.post<Product>("/products", payload);
      showToast("success", `Product "${formData.name}" listed & mapped to ${selectedStoreIds.length} branch stores!`);
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error("[ProductsPage] Create product failed:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This will also remove store inventory links.`)) return;

    try {
      await api.del(`/products/${productId}`);
      showToast("success", `"${productName}" deleted.`);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      console.error("[ProductsPage] Delete product failed:", err);
      showToast("error", "Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? "✓ " : "⚠ "}{toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Master Product & Service Catalog
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage B2B products, dynamic specs, pricing tiers, and multi-location branch inventory.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product / Service
          </button>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground text-sm">Loading catalog...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-foreground font-semibold text-lg">No products in catalog yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Add your products with JSON specifications, tiered pricing, and link them to your physical store branches.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Product Listing
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.productId} className="b2b-card p-5 flex flex-col h-full bg-card rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {product.availability || "AVAILABLE"}
                    </span>
                    <button
                      onClick={() => handleDelete(product.productId, product.productName)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-1">{product.productName}</h3>
                <p className="text-xs text-muted-foreground mb-3">{product.category} • {product.productType || "Product"}</p>

                {/* Display tags if present */}
                {Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto border-t border-border pt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold text-foreground flex items-center">
                      <IndianRupee className="w-3 h-3" /> {product.pricing || "Quote"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPREHENSIVE PRODUCT ADDING MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" /> Add Catalog Item (Product / Service)
                  </h2>
                  <p className="text-xs text-muted-foreground">Configure specs, pricing tiers & branch store inventory.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                {/* 1. Core Fields */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Core Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold">Product Name *</label>
                      <input
                        type="text" required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        placeholder="e.g. Stainless Steel Seamless Pipes"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Type</label>
                      <select
                        value={formData.productType}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                      >
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                      >
                        <option value="Raw Materials">Raw Materials & Metals</option>
                        <option value="Machinery">Machinery & Industrial Equipment</option>
                        <option value="Electronics">Electronics & Components</option>
                        <option value="Chemicals">Chemicals & Polymers</option>
                        <option value="Services">Services & Contracting</option>
                        <option value="Logistics">Logistics & Freight</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        placeholder="Brief overview..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Metadata: Tags & Specifications Builder */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Metadata & Specifications (JSONB)
                  </h3>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Search Tags (Chips)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                        className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm"
                        placeholder="Type tag and press Add..."
                      />
                      <button type="button" onClick={handleAddTag} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold">
                        Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                          #{t}
                          <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Specifications Key-Value Builder */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold">Specifications (Dynamic Key-Value Pairs)</label>
                      <button type="button" onClick={handleAddSpec} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Property
                      </button>
                    </div>
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Key (e.g. Material)"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                          className="w-1/3 px-3 py-1.5 bg-background border border-border rounded-md text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 316L Stainless Steel)"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-xs"
                        />
                        <button type="button" onClick={() => handleRemoveSpec(idx)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Pricing Engine: Fixed / RFQ / Tiered */}
                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" /> B2B Pricing Engine
                    </h3>
                    <div className="flex bg-muted p-0.5 rounded-lg text-xs">
                      {["Fixed", "RFQ", "Tiered"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, pricingMode: mode })}
                          className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                            formData.pricingMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.pricingMode === "Fixed" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Fixed Price / Quote Display</label>
                      <input
                        type="text"
                        value={formData.fixedPrice}
                        onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        placeholder="e.g. ₹2,500 / 10kg"
                      />
                    </div>
                  )}

                  {formData.pricingMode === "Tiered" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold">Bulk Volume Tier Ranges</label>
                        <button type="button" onClick={handleAddTier} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Pricing Tier
                        </button>
                      </div>
                      {tiers.map((tier, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-muted/30 p-2 rounded-lg border border-border">
                          <input
                            type="number"
                            placeholder="Min Qty"
                            value={tier.minQty}
                            onChange={(e) => handleTierChange(idx, "minQty", parseInt(e.target.value) || 0)}
                            className="px-2 py-1 bg-background border border-border rounded text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Max Qty"
                            value={tier.maxQty}
                            onChange={(e) => handleTierChange(idx, "maxQty", parseInt(e.target.value) || 0)}
                            className="px-2 py-1 bg-background border border-border rounded text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={tier.price}
                            onChange={(e) => handleTierChange(idx, "price", parseFloat(e.target.value) || 0)}
                            className="px-2 py-1 bg-background border border-border rounded text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Unit"
                              value={tier.unit}
                              onChange={(e) => handleTierChange(idx, "unit", e.target.value)}
                              className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
                            />
                            <button type="button" onClick={() => handleRemoveTier(idx)} className="p-1 text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Multi-Location Inventory Store Branch Mapping Checklist */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Multi-Location Inventory Mapping
                  </h3>
                  <p className="text-xs text-muted-foreground">Select physical store branches stocking this item for spatial search queries.</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Default Local Price (₹)</label>
                      <input
                        type="number"
                        value={formData.localPrice}
                        onChange={(e) => setFormData({ ...formData, localPrice: e.target.value })}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Default Stock Quantity</label>
                      <input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-xs"
                      />
                    </div>
                  </div>

                  {stores.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded">
                      ⚠ No store branches registered yet. Add branches in My Company profile to enable location-aware discovery.
                    </p>
                  ) : (
                    <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border max-h-40 overflow-y-auto">
                      {stores.map((store) => (
                        <label key={store.storeId} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                          <input
                            type="checkbox"
                            checked={selectedStoreIds.includes(store.storeId)}
                            onChange={() => handleToggleStore(store.storeId)}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>{store.storeName} ({store.city || "Branch"})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Listing Product..." : "Save & Publish Listing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}