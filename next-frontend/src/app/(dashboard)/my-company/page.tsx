/**
 * MyCompanyPage — Company Profile dashboard view with Multi-Location Stores/Branches.
 */

"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import {
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Briefcase,
  Phone,
  Globe,
  Upload,
  User,
  Navigation,
} from "lucide-react";

import { api } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ------------------------------------------------------------------ Types

interface StoreBranch {
  storeId?: string;
  companyId?: string;
  storeName: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

interface CompanyProfile {
  companyId?: string;
  logoUrl: string;
  title: string;
  founder: string;
  about: string;
  location: string;
  specialization: string;
  businessType?: string;
  industry?: string;
  locatedIn?: string;
  phoneNumbers: string[];
  emails: string[];
  website: string;
  clients: string[];
  verificationStatus: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
  };
}

const EMPTY_PROFILE: CompanyProfile = {
  logoUrl: "",
  title: "",
  founder: "",
  about: "",
  location: "",
  specialization: "",
  phoneNumbers: [""],
  emails: [""],
  website: "",
  clients: [],
  verificationStatus: "UNVERIFIED",
  socialLinks: { linkedin: "", twitter: "" },
};

function loadSession(): { companyId: string; email: string; companyName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    console.warn("[MyCompanyPage] Failed to parse barea_session.");
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResponseToProfile(data: any): CompanyProfile {
  return {
    companyId:          data.companyId,
    logoUrl:            data.logoUrl ?? data.logo ?? "",
    title:              data.companyName ?? data.title ?? "",
    founder:            data.founder ?? "",
    about:              data.about ?? "",
    location:           data.location ?? data.located ?? "",
    specialization:     data.specialization ?? data.industry ?? "",
    businessType:       data.businessType ?? "",
    industry:           data.industry ?? "",
    locatedIn:          data.locatedIn ?? "",
    verificationStatus: data.verificationStatus ?? "UNVERIFIED",
    phoneNumbers:       Array.isArray(data.phoneNumbers)
                          ? data.phoneNumbers.filter(Boolean)
                          : data.phone ? [data.phone] : [""],
    emails:             Array.isArray(data.emails)
                          ? data.emails.filter(Boolean)
                          : data.email ? [data.email] : [""],
    website:            data.website ?? "",
    clients:            Array.isArray(data.clients) ? data.clients : [],
    socialLinks: {
      linkedin: data.socialLinks?.linkedin ?? "",
      twitter:  data.socialLinks?.twitter  ?? "",
    },
  };
}

export default function MyCompanyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [formData, setFormData] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Store branches state
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState<StoreBranch>({
    storeName: "",
    city: "",
    latitude: null,
    longitude: null,
  });
  const [isLocatingStore, setIsLocatingStore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------- Fetch profile & stores
  const fetchStores = async (companyId: string) => {
    console.log("[MyCompanyPage] Fetching stores for companyId:", companyId);
    try {
      const data = await api.get<StoreBranch[]>(`/company/${companyId}/stores`);
      console.log("[MyCompanyPage] Fetched stores count:", data.length);
      setStores(data);
    } catch (err) {
      console.error("[MyCompanyPage] Failed to fetch stores:", err);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      console.log("[MyCompanyPage] Fetching profile on mount.");
      const session = loadSession();

      if (!session) {
        console.warn("[MyCompanyPage] No session found in localStorage.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<Record<string, unknown>>(
          `/company/profile?email=${encodeURIComponent(session.email)}`,
        );
        console.log("[MyCompanyPage] Profile data fetched:", data);
        const mapped = mapResponseToProfile(data);
        if (!mapped.companyId) mapped.companyId = session.companyId;
        setProfile(mapped);
        setFormData(mapped);

        if (mapped.companyId) {
          fetchStores(mapped.companyId);
        }
      } catch (err) {
        console.error("[MyCompanyPage] Failed to fetch profile:", err);
        const fallback: CompanyProfile = {
          ...EMPTY_PROFILE,
          companyId: session.companyId,
          title: session.companyName ?? "",
          emails: [session.email],
        };
        setProfile(fallback);
        setFormData(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // ------------------------------------------------------------- Edit controls
  const handleEditClick = () => {
    setFormData(profile);
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const session = loadSession();
    const companyId = formData.companyId ?? session?.companyId;

    if (!companyId) {
      setSaveError("Company ID missing. Please register first.");
      return;
    }

    const payload = {
      companyName: formData.title,
      founder: formData.founder,
      email: formData.emails[0] ?? "",
      password: "",
      phone: formData.phoneNumbers[0] ?? "",
      phoneNumbers: formData.phoneNumbers,
      emails: formData.emails,
      about: formData.about,
      location: formData.location,
      located: formData.location,
      specialization: formData.specialization,
      industry: formData.industry ?? formData.specialization,
      businessType: formData.businessType ?? "",
      website: formData.website,
      logo: formData.logoUrl,
      clients: formData.clients,
      socialLinks: formData.socialLinks,
    };

    console.log("[MyCompanyPage] Updating profile via PUT /company/profile/" + companyId, payload);

    try {
      const updated = await api.put<Record<string, unknown>>(
        `/company/profile/${companyId}`,
        payload,
      );
      const mapped = mapResponseToProfile(updated);
      mapped.companyId = companyId;
      setProfile(mapped);
      setFormData(mapped);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("[MyCompanyPage] Failed to update profile:", err);
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    }
  };

  // ------------------------------------------------------------- Store Branch Management
  const handleAddStoreClick = () => {
    setNewStore({
      storeName: "",
      city: "",
      latitude: null,
      longitude: null,
    });
    setIsStoreDialogOpen(true);
  };

  const handleDetectStoreLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocatingStore(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewStore((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setIsLocatingStore(false);
      },
      (err) => {
        alert("Failed to detect location: " + err.message);
        setIsLocatingStore(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveStore = async () => {
    const session = loadSession();
    const companyId = profile.companyId ?? session?.companyId;

    if (!companyId) {
      alert("Cannot create store branch: Company ID missing.");
      return;
    }
    if (!newStore.storeName) {
      alert("Please enter a Branch Name.");
      return;
    }

    console.log("[MyCompanyPage] POST /company/" + companyId + "/stores", newStore);

    try {
      const created = await api.post<StoreBranch>(
        `/company/${companyId}/stores`,
        {
          storeName: newStore.storeName,
          city: newStore.city,
          latitude: newStore.latitude,
          longitude: newStore.longitude,
        }
      );
      console.log("[MyCompanyPage] Store branch created:", created);
      setStores((prev) => [...prev, created]);
      setIsStoreDialogOpen(false);
    } catch (err) {
      console.error("[MyCompanyPage] Failed to create store:", err);
      alert("Failed to save store branch.");
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Are you sure you want to delete this store branch?")) return;
    console.log("[MyCompanyPage] DELETE /company/stores/" + storeId);
    try {
      await api.delete(`/company/stores/${storeId}`);
      setStores((prev) => prev.filter((s) => s.storeId !== storeId));
    } catch (err) {
      console.error("[MyCompanyPage] Delete store failed:", err);
      alert("Failed to delete store.");
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 md:p-10 space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      <Card className="w-full border-none shadow-none bg-transparent rounded-none p-[2vw]">
        {/* Header Bar */}
        <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Company Profile & Physical Branches</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {profile.verificationStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-medium">✓ Saved</span>
            )}
            {saveError && (
              <span className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded">
                ⚠ {saveError}
              </span>
            )}

            {!isEditing ? (
              <Button onClick={handleEditClick} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="ghost" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground">
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-border shadow-inner bg-muted relative flex items-center justify-center">
                {(isEditing ? formData.logoUrl : profile.logoUrl) ? (
                  <Image
                    src={isEditing ? formData.logoUrl : profile.logoUrl}
                    alt="Company Logo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center text-white text-xs font-medium opacity-90 transition-opacity hover:opacity-100"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span>Change Logo</span>
                </button>
              )}
            </div>

            <div className="w-full max-w-md">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-center font-bold text-xl"
                  placeholder="Company Name"
                />
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {profile.title || "Your Company Name"}
                </h1>
              )}
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* About */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> About Company
              </label>
              {isEditing ? (
                <Textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={3}
                  placeholder="Describe your company business..."
                />
              ) : (
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/50">
                  {profile.about || <span className="text-muted-foreground italic">No description added yet.</span>}
                </p>
              )}
            </div>

            {/* Founder */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Founder / CEO
              </label>
              {isEditing ? (
                <Input
                  value={formData.founder}
                  onChange={(e) => setFormData({ ...formData, founder: e.target.value })}
                  placeholder="Founder Name"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile.founder || "—"}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Website
              </label>
              {isEditing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              ) : (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline block truncate">
                  {profile.website || "—"}
                </a>
              )}
            </div>

            {/* Specialization & Industry */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Specialization / Industry
              </label>
              {isEditing ? (
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Steel Manufacturing & Supply"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile.specialization || "—"}</p>
              )}
            </div>

            {/* Contact Phone & Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact Phone
              </label>
              <p className="text-sm font-medium text-foreground">{profile.phoneNumbers[0] || "—"}</p>
            </div>
          </div>

          {/* PHYSICAL BRANCHES / LOCATIONS SUB-SECTION */}
          <div className="border-t border-border pt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-primary" /> Physical Store Branches & Warehouses
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage physical locations used for PostGIS spatial radius discovery queries.
                </p>
              </div>
              <Button onClick={handleAddStoreClick} size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add New Branch
              </Button>
            </div>

            {stores.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-2">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No physical store branches registered yet.</p>
                <Button onClick={handleAddStoreClick} variant="outline" size="sm">
                  Add First Store Branch
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <Card key={store.storeId} className="border border-border/80 shadow-sm relative group hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">{store.storeName}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" /> {store.city || "City not specified"}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => store.storeId && handleDeleteStore(store.storeId)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-2 text-xs space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                          GPS: {store.latitude ? store.latitude.toFixed(4) : "N/A"}, {store.longitude ? store.longitude.toFixed(4) : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DIALOG / MODAL TO ADD A NEW STORE BRANCH */}
      {isStoreDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Add Physical Store Branch
              </h3>
              <button onClick={() => setIsStoreDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Branch Name *</label>
                <Input
                  placeholder="e.g. Bangalore Warehouse / Central Branch"
                  value={newStore.storeName}
                  onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">City</label>
                <Input
                  placeholder="e.g. Bangalore"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                />
              </div>
              <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">GPS Spatial Coordinates</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectStoreLocation}
                    disabled={isLocatingStore}
                    className="h-7 text-xs flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {isLocatingStore ? "Locating..." : "Use My GPS"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="12.9716"
                      value={newStore.latitude ?? ""}
                      onChange={(e) => setNewStore({ ...newStore, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="77.5946"
                      value={newStore.longitude ?? ""}
                      onChange={(e) => setNewStore({ ...newStore, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsStoreDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveStore}>Save Store Branch</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
