/**
 * MyCompanyPage — Company Profile dashboard view.
 *
 * On mount:
 *  1. Reads `barea_session` from localStorage to get the companyId + email
 *     stored during registration.
 *  2. Fetches the full profile from GET /api/company/profile?email={email}.
 *  3. Falls back to INITIAL_DATA only if the fetch fails or no session exists,
 *     so the page is never blank.
 *
 * On save:
 *  - Uses PUT /api/company/profile/{companyId} (correct HTTP method).
 *  - Sends a blank password field so the service layer knows NOT to re-hash.
 *
 * Logo upload:
 *  - For MVP, the logo is stored as a blob URL (local preview only).
 *  - TODO Phase 2.5: wire to POST /api/company/upload-logo (multipart).
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
  Mail,
  Globe,
  Share2,
  Upload,
} from "lucide-react";

import { api } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ------------------------------------------------------------------ Types

interface CompanyProfile {
  companyId?: string;
  logoUrl: string;
  title: string;
  about: string;
  location: string;
  specialization: string;
  businessType?: string;
  industry?: string;
  locatedIn?: string;
  phoneNumbers: string[];
  emails: string[];
  website: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
  };
}

// ------------------------------------------------------------------ Fallback data

const EMPTY_PROFILE: CompanyProfile = {
  logoUrl: "",
  title: "",
  about: "",
  location: "",
  specialization: "",
  phoneNumbers: [""],
  emails: [""],
  website: "",
  socialLinks: { linkedin: "", twitter: "" },
};

// ------------------------------------------------------------------ Helpers

/** Reads the barea_session from localStorage. Returns null if not found. */
function loadSession(): { companyId: string; email: string; companyName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("barea_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    console.warn("[MyCompanyPage] Failed to parse barea_session from localStorage.");
    return null;
  }
}

/** Maps the backend response object to our CompanyProfile interface. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResponseToProfile(data: any): CompanyProfile {
  return {
    companyId:     data.companyId,
    logoUrl:       data.logoUrl ?? data.logo ?? "",
    title:         data.companyName ?? data.title ?? "",
    about:         data.about ?? "",
    location:      data.location ?? data.located ?? "",
    specialization: data.specialization ?? data.industry ?? "",
    businessType:  data.businessType ?? "",
    industry:      data.industry ?? "",
    locatedIn:     data.locatedIn ?? "",
    phoneNumbers:  Array.isArray(data.phoneNumbers)
                     ? data.phoneNumbers.filter(Boolean)
                     : data.phone ? [data.phone] : [""],
    emails:        Array.isArray(data.emails)
                     ? data.emails.filter(Boolean)
                     : data.email ? [data.email] : [""],
    website:       data.website ?? "",
    socialLinks: {
      linkedin: data.socialLinks?.linkedin ?? "",
      twitter:  data.socialLinks?.twitter  ?? "",
    },
  };
}

// ------------------------------------------------------------------ Component

export default function MyCompanyPage() {
  const [isEditing,  setIsEditing]  = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [profile,    setProfile]    = useState<CompanyProfile>(EMPTY_PROFILE);
  const [formData,   setFormData]   = useState<CompanyProfile>(EMPTY_PROFILE);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------- Fetch on mount

  useEffect(() => {
    async function fetchProfile() {
      console.log("[MyCompanyPage] useEffect: fetching profile on mount.");
      const session = loadSession();

      if (!session) {
        console.warn("[MyCompanyPage] No session found. Using empty profile. Please register first.");
        setIsLoading(false);
        return;
      }

      console.log("[MyCompanyPage] Session found:", session.email, "companyId:", session.companyId);

      try {
        const data = await api.get<Record<string, unknown>>(
          `/company/profile?email=${encodeURIComponent(session.email)}`,
        );
        console.log("[MyCompanyPage] Profile fetched successfully:", data);
        const mapped = mapResponseToProfile(data);
        // Preserve companyId from session if not returned by backend
        if (!mapped.companyId) mapped.companyId = session.companyId;
        setProfile(mapped);
        setFormData(mapped);
      } catch (err) {
        console.error("[MyCompanyPage] Failed to fetch profile:", err);
        // On fetch failure, pre-fill at least the email/companyName from session
        const fallback: CompanyProfile = {
          ...EMPTY_PROFILE,
          companyId: session.companyId,
          title:     session.companyName ?? "",
          emails:    [session.email],
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
    console.log("[MyCompanyPage] Entered edit mode.");
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setSaveError(null);
    console.log("[MyCompanyPage] Edit cancelled.");
  };

  const handleSave = async () => {
    console.log("[MyCompanyPage] handleSave() called.");
    setSaveError(null);
    setSaveSuccess(false);

    const session = loadSession();
    const companyId = formData.companyId ?? session?.companyId;

    if (!companyId) {
      const msg = "Cannot save: companyId is missing. Please register or log in first.";
      console.error("[MyCompanyPage]", msg);
      setSaveError(msg);
      return;
    }

    // Build the update payload.
    // We intentionally leave password blank so the service layer skips re-hashing.
    const payload = {
      companyName:  formData.title,
      email:        formData.emails[0] ?? "",
      password:     "",            // ← blank = "keep existing hash"
      phone:        formData.phoneNumbers[0] ?? "",
      phoneNumbers: formData.phoneNumbers,
      emails:       formData.emails,
      about:        formData.about,
      location:     formData.location,
      located:      formData.location,
      specialization: formData.specialization,
      industry:     formData.industry ?? formData.specialization,
      businessType: formData.businessType ?? "",
      locatedIn:    formData.locatedIn ?? "",
      website:      formData.website,
      logo:         formData.logoUrl,
      socialLinks:  formData.socialLinks,
    };

    console.log("[MyCompanyPage] PUT /company/profile/" + companyId, payload);

    try {
      // Use PUT with the companyId in the path — this is the correct REST verb for updates.
      const updated = await api.put<Record<string, unknown>>(
        `/company/profile/${companyId}`,
        payload,
      );
      console.log("[MyCompanyPage] Profile updated successfully:", updated);
      const mapped = mapResponseToProfile(updated);
      mapped.companyId = companyId;
      setProfile(mapped);
      setFormData(mapped);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed. Please try again.";
      console.error("[MyCompanyPage] Save failed:", err);
      setSaveError(message);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For MVP: create a local blob URL for preview.
      // TODO: send the file to POST /api/company/upload-logo and store the returned URL.
      const imageUrl = URL.createObjectURL(file);
      console.log("[MyCompanyPage] Logo file selected, blob URL created:", imageUrl);
      setFormData((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  const handleArrayChange = (
    field: "phoneNumbers" | "emails",
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayField = (field: "phoneNumbers" | "emails") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field: "phoneNumbers" | "emails", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ------------------------------------------------------------- Loading state

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  // ------------------------------------------------------------- Render

  return (
    <div className="w-full min-h-screen p-6 md:p-10">
      {/* Hidden File Input Triggered on Logo Click */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      <Card className="w-full border-none shadow-none bg-transparent rounded-none p-[4vw]">
        {/* Header Bar with Action Controls */}
        <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Company Profile</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Success / Error feedback banners */}
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-medium badge-verified">
                ✓ Saved successfully
              </span>
            )}
            {saveError && (
              <span className="text-xs text-destructive font-medium bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 rounded-full">
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
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-primary text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          {/* Logo & Title Centered Section */}
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
                  // Placeholder when no logo is set
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>

              {/* Edit Logo Button Overlay */}
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

            {/* Title Display or Input */}
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

          {/* Details Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* About Section */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> About Company
              </label>
              {isEditing ? (
                <Textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={3}
                  placeholder="Describe your business..."
                />
              ) : (
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/50">
                  {profile.about || <span className="text-muted-foreground italic">No description added yet.</span>}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>
              {isEditing ? (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State, Country"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile.location || "—"}</p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Specialization
              </label>
              {isEditing ? (
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Core Business Domain"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{profile.specialization || "—"}</p>
              )}
            </div>

            {/* Business Details */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Business Details
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={formData.businessType || ""}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    placeholder="Business Type (e.g. manufacturer)"
                  />
                  <Input
                    value={formData.industry || ""}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Industry (e.g. IT & Software)"
                  />
                  <Input
                    value={formData.locatedIn || ""}
                    onChange={(e) => setFormData({ ...formData, locatedIn: e.target.value })}
                    placeholder="Country / Location"
                  />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4">
                  <p className="text-sm font-medium text-foreground">
                    <span className="bg-purple-400/20 text-purple-700 rounded px-1">{profile.businessType || "—"}</span>
                    {" "}of{" "}
                    <span className="bg-yellow-400/20 text-yellow-700 rounded px-1">{profile.industry || "—"}</span>
                    , located in{" "}
                    <span className="bg-green-400/20 text-green-700 rounded px-1">{profile.locatedIn || "—"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Phone Numbers */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Numbers
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  {formData.phoneNumbers.map((phone, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => handleArrayChange("phoneNumbers", idx, e.target.value)}
                        placeholder="Phone number"
                      />
                      {formData.phoneNumbers.length > 1 && (
                        <Button type="button" variant="ghost" size="icon"
                          onClick={() => removeArrayField("phoneNumbers", idx)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => addArrayField("phoneNumbers")} className="w-full mt-1">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Phone
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {profile.phoneNumbers.filter(Boolean).map((phone, idx) => (
                    <p key={idx} className="text-sm font-medium text-foreground">{phone}</p>
                  ))}
                  {profile.phoneNumbers.filter(Boolean).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No phone numbers added.</p>
                  )}
                </div>
              )}
            </div>

            {/* Email Addresses */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Addresses
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  {formData.emails.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={email}
                        onChange={(e) => handleArrayChange("emails", idx, e.target.value)}
                        placeholder="Email address"
                      />
                      {formData.emails.length > 1 && (
                        <Button type="button" variant="ghost" size="icon"
                          onClick={() => removeArrayField("emails", idx)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => addArrayField("emails")} className="w-full mt-1">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {profile.emails.filter(Boolean).map((email, idx) => (
                    <a key={idx} href={`mailto:${email}`}
                      className="block text-sm font-medium text-primary hover:underline">
                      {email}
                    </a>
                  ))}
                </div>
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
                <a href={profile.website} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline block truncate">
                  {profile.website || "—"}
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Social Profiles
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })}
                    placeholder="LinkedIn URL"
                  />
                  <Input
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })}
                    placeholder="Twitter/X URL"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline truncate">
                      LinkedIn: {profile.socialLinks.linkedin}
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline truncate">
                      Twitter/X: {profile.socialLinks.twitter}
                    </a>
                  )}
                  {!profile.socialLinks.linkedin && !profile.socialLinks.twitter && (
                    <p className="text-sm text-muted-foreground italic">No social profiles added.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
