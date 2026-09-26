"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export interface NavTag {
  name: string;
  column: string;
}

interface NavbarProps {
  tags?: NavTag[];
}

interface CompanyInfo {
  companyId?: string;
  name: string;
  logoUrl?: string;
  email?: string;
}

const DEFAULT_TAGS: NavTag[] = [
  { name: "Home", column: "home" },
  { name: "Textiles & Garments", column: "textiles" },
  { name: "Industrial Machinery", column: "machinery" },
  { name: "Automotive Parts", column: "automotive" },
];

function loadSession(): { companyId: string; email: string; companyName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Navbar({ tags = DEFAULT_TAGS }: NavbarProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    async function checkAuthAndFetchCompany() {
      const session = loadSession();
      if (!session || !session.email) {
        setIsLoggedIn(false);
        setCompany(null);
        return;
      }

      setIsLoggedIn(true);

      // Default with session info initially so UI isn't blank
      setCompany({
        companyId: session.companyId,
        name: session.companyName || "My Company",
        email: session.email,
      });

      try {
        const data = await api.get<Record<string, unknown>>(
          `/company/profile?email=${encodeURIComponent(session.email)}`
        );
        if (data) {
          setCompany({
            companyId: (data.companyId as string) || session.companyId,
            name: (data.companyName as string) || (data.title as string) || session.companyName || "My Company",
            logoUrl: (data.logoUrl as string) || (data.logo as string) || "",
            email: (data.email as string) || session.email,
          });
        }
      } catch (err) {
        console.warn("[Navbar] Failed to fetch live backend company profile:", err);
      }
    }

    checkAuthAndFetchCompany();

    // Listen to potential storage updates across tabs/windows
    const handleStorageChange = () => checkAuthAndFetchCompany();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("barea_session");
    }
    setIsLoggedIn(false);
    setCompany(null);
    router.push("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // If check complete and user is not logged in, render hidden navbar header
  if (isLoggedIn === false) {
    return (
      <header className="sticky top-0 z-50 w-full b2b-glass border-b border-border shadow-sm hidden">
      </header>
    );
  }

  // Prevent flash during initial hydration/session check
  if (isLoggedIn === null) {
    return null;
  }

  const companyName = company?.name || "My Company";
  const companyLogoUrl = company?.logoUrl;

  return (
    <header className="sticky top-0 z-50 w-full b2b-glass border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Corner: Platform Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/home" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
                B
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                B_Area
              </span>
            </Link>
          </div>

          {/* Middle: Render tags dynamically from array (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2 scrollbar-none max-w-2xl">
            {tags.map((tag, idx) => (
              <Link
                key={`${tag.column}-${idx}`}
                href={`/${tag.column}`}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-md transition-all duration-150 hover:text-foreground hover:bg-muted whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {tag.name}
              </Link>
            ))}
          </nav>

          {/* Right Corner: Company Logo + Dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                type="button"
                className="flex items-center gap-2 p-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {companyLogoUrl ? (
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary-foreground font-semibold flex items-center justify-center text-xs border border-border">
                    {companyName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-foreground pr-1 max-w-[100px] truncate">
                  {companyName}
                </span>
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Modal / Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop to dismiss menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-card border border-border shadow-lg z-50 py-1.5 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-semibold text-foreground truncate">{companyName}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-company"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        Company Profile
                      </Link>
                      <Link
                        href="/my-company/products"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        Manage Products
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-border">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors font-medium"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDropdown}
              type="button"
              className="p-1 rounded-full border border-border bg-card"
            >
              {companyLogoUrl ? (
                <img
                  src={companyLogoUrl}
                  alt={companyName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-secondary/20 text-secondary-foreground font-semibold flex items-center justify-center text-xs">
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              type="button"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-2 pb-4 space-y-3">
          <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider px-2 pt-1">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-1">
            {tags.map((tag, idx) => (
              <Link
                key={`mobile-${tag.column}-${idx}`}
                href={`/category/${tag.column}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="px-2 pb-2">
              <p className="text-xs text-muted-foreground">Logged in company</p>
              <p className="text-sm font-semibold text-foreground">{companyName}</p>
            </div>
            <div className="space-y-1">
              <Link
                href="/my-company"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs text-foreground hover:bg-muted"
              >
                Company Profile
              </Link>
              <Link
                href="/my-company/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-xs text-foreground hover:bg-muted"
              >
                Manage Products
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-3 py-2 rounded-md text-xs text-destructive hover:bg-destructive/10 font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
