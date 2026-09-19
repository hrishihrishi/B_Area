/**
 * logo (in centre)
 * title (under logo bold)
 * about
 * location
 * specialization
 * phone numbers
 * email
 * website
 * social links
 *
 * display an edit button top-right corner, onClick turn all values into input fields and on submit make it save and display in same position.
 * when clicked on edit button for logo img it has to open file manager thingy
 */

"use client";

import React, { useState, useRef, ChangeEvent } from "react";
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
import { loadRegistrationDraft } from "@/lib/registration-storage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CompanyProfile {
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

const INITIAL_DATA: CompanyProfile = {
  logoUrl:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  title: "Apex Nexus Tech Solutions Pvt Ltd",
  about:
    "Leading enterprise B2B service provider specializing in scalable cloud architecture, custom software development, and AI-driven workflow automations for industrial SMBs.",
  location: "Mumbai, Maharashtra, India",
  specialization: "Cloud Infrastructure & AI Solutions",
  businessType: "manufacturer",
  industry: "it_software",
  locatedIn: "India",
  phoneNumbers: ["+91 98765 43210", "+91 22 4000 1234"],
  emails: ["contact@apexnexus.com", "sales@apexnexus.com"],
  website: "https://apexnexus.com",
  socialLinks: {
    linkedin: "https://linkedin.com/company/apexnexus",
    twitter: "https://x.com/apexnexus",
  },
};

export default function MyCompanyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>(INITIAL_DATA);
  const [formData, setFormData] = useState<CompanyProfile>(INITIAL_DATA);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Use the current form/profile state for payload —
    // avoid reading a stale registration draft when updating profile.
    const payload = {
      name: formData.title,
      email: formData.emails[0] ?? profile.emails[0] ?? "",
      password: "",
      intent: "network",
      companyName: formData.title,
      title: formData.title,
      about: formData.about,
      location: formData.location,
      located: formData.location,
      specialization: formData.specialization,
      industry: formData.industry ?? formData.specialization,
      businessType: formData.businessType ?? "manufacturer",
      locatedIn: formData.locatedIn ?? formData.location,
      phone: formData.phoneNumbers[0] ?? "",
      phoneNumbers: formData.phoneNumbers,
      emails: formData.emails,
      website: formData.website,
      logo: formData.logoUrl,
      logoUrl: formData.logoUrl,
      socialLinks: formData.socialLinks,
    };

    try {
      await api.post("/api/company/profile", payload);
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Company profile save failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save company profile.",
      );
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
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
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "phoneNumbers" | "emails",
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

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
                <Image
                  src={isEditing ? formData.logoUrl : profile.logoUrl}
                  alt="Company Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-center font-bold text-xl"
                  placeholder="Company Name"
                />
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {profile.title}
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
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe your business..."
                />
              ) : (
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/50">
                  {profile.about}
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
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="City, State, Country"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {profile.location}
                </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  placeholder="Core Business Domain"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {profile.specialization}
                </p>
              )}
            </div>

            {/* Business Details (optional) */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Business Details
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={formData.businessType || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value })
                    }
                    placeholder="Business Type (e.g. manufacturer)"
                  />
                  <Input
                    value={formData.industry || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="Industry (e.g. IT & Software)"
                  />
                  <Input
                    value={formData.locatedIn || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, locatedIn: e.target.value })
                    }
                    placeholder="Country / Location"
                  />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4">
                  <p className="text-sm font-medium text-foreground">
                    <span className="bg-purple-400">
                      {profile.businessType}
                    </span>
                    of
                    <span className="bg-yellow-400"> {profile.industry}</span>,
                    located in
                    <span className="bg-green-400">{profile.locatedIn}</span>
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
                        onChange={(e) =>
                          handleArrayChange("phoneNumbers", idx, e.target.value)
                        }
                        placeholder="Phone number"
                      />
                      {formData.phoneNumbers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField("phoneNumbers", idx)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("phoneNumbers")}
                    className="w-full mt-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Phone
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {profile.phoneNumbers.map((phone, idx) => (
                    <p
                      key={idx}
                      className="text-sm font-medium text-foreground"
                    >
                      {phone}
                    </p>
                  ))}
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
                        onChange={(e) =>
                          handleArrayChange("emails", idx, e.target.value)
                        }
                        placeholder="Email address"
                      />
                      {formData.emails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField("emails", idx)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("emails")}
                    className="w-full mt-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {profile.emails.map((email, idx) => (
                    <a
                      key={idx}
                      href={`mailto:${email}`}
                      className="block text-sm font-medium text-primary hover:underline"
                    >
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
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://company.com"
                />
              ) : (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline block truncate"
                >
                  {profile.website}
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="LinkedIn URL"
                  />
                  <Input
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="Twitter/X URL"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate"
                  >
                    LinkedIn: {profile.socialLinks.linkedin}
                  </a>
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate"
                  >
                    Twitter/X: {profile.socialLinks.twitter}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
