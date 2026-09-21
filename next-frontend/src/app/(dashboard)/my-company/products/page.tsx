/**
 * Product Catalog Page — /my-company/products
 *
 * Fetches the logged-in company's products from GET /api/products?companyId={id}.
 * Add/edit/delete are wired to the real Spring Boot catalog endpoints.
 *
 * State management:
 *  - `products` is the source of truth (fetched from backend on mount).
 *  - On create/delete, the list is re-fetched from the server for consistency.
 *  - Toast notifications (inline state) appear for 3 seconds after mutations.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Package, IndianRupee, Trash2, Loader2 } from "lucide-react";

import { api } from "@/lib/api-client";

// ------------------------------------------------------------------ Types

interface Product {
  productId: string;
  companyId: string;
  productName: string;
  name?: string;          // alias
  category: string;
  pricing?: string;
  price?: string;         // alias
  availability: string;
  status?: string;        // alias
  productDescription?: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

// ------------------------------------------------------------------ Helpers

function loadSession(): { companyId: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ Component

export default function ProductsPage() {
  const router = useRouter();

  const [products,     setProducts]     = useState<Product[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast,        setToast]        = useState<Toast | null>(null);

  // Form state for the "Add New Product" modal
  const [formData, setFormData] = useState({
    name:        "",
    category:    "",
    price:       "",
    moq:         "",
    description: "",
    productType: "product",
  });

  // ---------------------------------------------------------- Toast helper

  function showToast(type: Toast["type"], message: string) {
    console.log("[ProductsPage] Toast:", type, message);
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // ---------------------------------------------------------- Fetch products

  async function fetchProducts() {
    const session = loadSession();
    if (!session) {
      console.warn("[ProductsPage] No session. Cannot fetch products.");
      setIsLoading(false);
      return;
    }

    console.log("[ProductsPage] Fetching products for companyId:", session.companyId);
    try {
      const data = await api.get<Product[]>(`/products?companyId=${session.companyId}`);
      console.log("[ProductsPage] Products fetched:", data);
      setProducts(data ?? []);
    } catch (err) {
      console.error("[ProductsPage] Failed to fetch products:", err);
      showToast("error", "Could not load products. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------- Create product

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const session = loadSession();
    if (!session) {
      showToast("error", "Session not found. Please re-login.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      companyId:          session.companyId,
      productName:        formData.name,
      name:               formData.name,
      category:           formData.category,
      pricing:            formData.price,
      price:              formData.price,
      productDescription: formData.description,
      productType:        formData.productType,
      availability:       "AVAILABLE",
      // companyName is required by the DB — use companyId as fallback if name not stored
      companyName:        session.email,
    };

    console.log("[ProductsPage] POST /products with payload:", payload);

    try {
      await api.post<Product>("/products", payload);
      showToast("success", `"${formData.name}" added successfully!`);
      setIsModalOpen(false);
      setFormData({ name: "", category: "", price: "", moq: "", description: "", productType: "product" });
      // Re-fetch the full list so we get the server-assigned productId
      await fetchProducts();
    } catch (err) {
      console.error("[ProductsPage] Create product failed:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------- Delete product

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    console.log("[ProductsPage] DELETE /products/" + productId);

    try {
      await api.del(`/products/${productId}`);
      showToast("success", `"${productName}" deleted.`);
      // Optimistic UI: remove from local state immediately
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      console.error("[ProductsPage] Delete product failed:", err);
      showToast("error", err instanceof Error ? err.message : "Failed to delete product.");
    }
  };

  // ---------------------------------------------------------- Render helpers

  const displayName    = (p: Product) => p.productName ?? p.name ?? "Unnamed Product";
  const displayPrice   = (p: Product) => p.pricing ?? p.price ?? "—";
  const displayStatus  = (p: Product) => p.availability ?? p.status ?? "AVAILABLE";

  // ------------------------------------------------------------------ Render

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">

      {/* -------- Toast Notification -------- */}
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

      <div className="max-w-7xl mx-auto">
        {/* -------- Header -------- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Product Catalog
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your B2B offerings and listings
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </header>

        {/* -------- Loading State -------- */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground text-sm">Loading products...</span>
          </div>
        )}

        {/* -------- Empty State -------- */}
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-foreground font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click &quot;Add New Product&quot; to list your first B2B offering.
            </p>
          </div>
        )}

        {/* -------- Product Grid -------- */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.productId} className="b2b-card p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        displayStatus(product) === "AVAILABLE" || displayStatus(product) === "Verified"
                          ? "badge-verified"
                          : "badge-pending"
                      }
                    >
                      {displayStatus(product)}
                    </span>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(product.productId, displayName(product))}
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
                  {displayName(product)}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{product.category}</p>

                <div className="mt-auto space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {displayPrice(product)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------- Add Product Modal -------- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Add New Product</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                {/* Product Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Product / Service Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text" id="name" name="name" required
                    value={formData.name} onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., High-Grade Cement"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-foreground">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="category" name="category" required
                    value={formData.category} onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Machinery">Machinery &amp; Equipment</option>
                    <option value="Software">Software &amp; SaaS</option>
                    <option value="Textiles">Textiles &amp; Apparel</option>
                    <option value="Services">Professional Services</option>
                    <option value="Electronics">Electronics &amp; Hardware</option>
                    <option value="Chemicals">Chemicals &amp; Plastics</option>
                    <option value="Logistics">Logistics &amp; Freight</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-foreground">
                    Pricing <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text" id="price" name="price" required
                    value={formData.price} onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., ₹85,000 / ton or Contact for quote"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    id="description" name="description" rows={3}
                    value={formData.description} onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                  <button
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Saving..." : "Save Product"}
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