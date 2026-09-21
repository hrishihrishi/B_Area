/**
 * Find Companies — Public Marketplace Search
 * Route: /find-companies
 *
 * A debounced search input that queries GET /api/search?q={query}.
 * Results are rendered in a responsive grid, badged as "Company" or "Product".
 *
 * Debounce: 400ms — waits for the user to stop typing before hitting the API.
 * This prevents excessive backend calls on every keystroke.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Building2, Package, MapPin, Briefcase, Loader2, X } from "lucide-react";

import { api } from "@/lib/api-client";

// ------------------------------------------------------------------ Types

interface SearchResult {
  resultType: "company" | "product";
  id: string;
  name: string;
  companyName: string;
  category: string;
  meta: string;         // location (company) or price (product)
  logoUrl: string | null;
  score: number;
}

// ------------------------------------------------------------------ Component

export default function FindCompaniesPage() {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Holds the debounce timer ID so we can cancel it on each keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------- Debounced search

  useEffect(() => {
    // Clear any pending debounce timer on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // If the user cleared the input, reset results immediately
    if (trimmed.length === 0) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Wait 400ms after the user stops typing before sending the request
    debounceRef.current = setTimeout(async () => {
      console.log("[FindCompaniesPage] Debounced search fired for query:", trimmed);
      setIsSearching(true);
      setError(null);

      try {
        const data = await api.get<SearchResult[]>(
          `/search?q=${encodeURIComponent(trimmed)}&limit=20`,
        );
        console.log("[FindCompaniesPage] Search results:", data);
        setResults(data ?? []);
        setHasSearched(true);
      } catch (err) {
        console.error("[FindCompaniesPage] Search error:", err);
        const isNetwork = err instanceof TypeError && err.message.includes("fetch");
        setError(
          isNetwork
            ? "Cannot reach the backend. Is the Spring Boot server running on :8080?"
            : err instanceof Error
              ? err.message
              : "Search failed. Please try again.",
        );
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    // Cleanup: cancel timer if component unmounts mid-debounce
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ------------------------------------------------------------------ Render

  const companyCount = results.filter((r) => r.resultType === "company").length;
  const productCount = results.filter((r) => r.resultType === "product").length;

  return (
    <div className="min-h-screen bg-background">

      {/* -------- Hero Search Section -------- */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            Discover B2B Companies &amp; Products
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            Search our verified marketplace by name, industry, product, or category.
          </p>

          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Steel, Cloud Software, Apex Nexus..."
              className="w-full pl-12 pr-12 py-3.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm transition-all"
              autoFocus
            />
            {/* Clear button */}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result count summary */}
          {hasSearched && !isSearching && (
            <p className="text-xs text-muted-foreground mt-4">
              Found <strong>{results.length}</strong> results
              {companyCount > 0 && <> — <span className="text-primary">{companyCount} companies</span></>}
              {productCount > 0 && <> &amp; <span className="text-accent">{productCount} products</span></>}
            </p>
          )}
        </div>
      </section>

      {/* -------- Results Section -------- */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Loading state */}
        {isSearching && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground text-sm">Searching...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center max-w-lg mx-auto">
            ⚠ {error}
          </div>
        )}

        {/* No results */}
        {hasSearched && !isSearching && results.length === 0 && !error && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-medium text-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different keyword or check your spelling.
            </p>
          </div>
        )}

        {/* Initial empty state */}
        {!hasSearched && !isSearching && !error && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Start typing to search the marketplace...</p>
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((result) => (
              <div
                key={`${result.resultType}-${result.id}`}
                className="b2b-card p-5 flex flex-col gap-3"
              >
                {/* Type Badge + Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      result.resultType === "company"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-accent/10 text-accent border-accent/20"
                    }`}
                  >
                    {result.resultType === "company" ? (
                      <Building2 className="w-3.5 h-3.5" />
                    ) : (
                      <Package className="w-3.5 h-3.5" />
                    )}
                    {result.resultType === "company" ? "Company" : "Product"}
                  </div>

                  {/* Relevance score badge (helpful for debugging) */}
                  <span className="text-[10px] text-muted-foreground/60 font-mono">
                    {result.score?.toFixed(2)}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h2 className="font-semibold text-foreground leading-tight line-clamp-2">
                    {result.name}
                  </h2>
                  {/* For products, show the company name underneath */}
                  {result.resultType === "product" && result.companyName !== result.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {result.companyName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{result.category}</span>
                </div>

                {/* Meta (location for companies, price for products) */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{result.meta}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
