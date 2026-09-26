"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  registrationSchema,
  type RegistrationFormValues,
} from "@/lib/validations/auth";
import { api } from "@/lib/api-client";
import {
  clearRegistrationDraft,
  saveRegistrationDraft,
} from "@/lib/registration-storage";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/modules/auth/step-indicator";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      industry: "it_software",
      city: "Bangalore",
      latitude: undefined,
      longitude: undefined,
      intent: "sell",
    },
    mode: "onChange",
  });

  // Automatically prompt geolocation in Step 2 if not set
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      console.warn("[RegisterPage] Geolocation API is not supported by this browser.");
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detecting location...");
    console.log("[RegisterPage] Requesting navigator.geolocation.getCurrentPosition()...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(`[RegisterPage] Geolocation obtained: lat=${lat}, lng=${lng}`);
        
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
        setLocationStatus(`Location locked! (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsLocating(false);
      },
      (error) => {
        console.error("[RegisterPage] Geolocation error:", error.message);
        setLocationStatus(`Failed to get location: ${error.message}. Using default city.`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Validate current step before advancing
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger([
        "name",
        "email",
        "password",
        "confirmPassword",
        "companyName",
        "industry",
      ]);
      console.log("[RegisterPage] Step 1 validation result:", isValid);
    }

    if (isValid) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    console.log("[RegisterPage] Submitting registration form:", data);

    try {
      const payload = {
        email:        data.email,
        password:     data.password,
        companyName:  data.companyName || data.name,
        founder:      data.name,
        industry:     data.industry,
        located:      data.city || "Bangalore",
        city:         data.city || "Bangalore",
        latitude:     data.latitude,
        longitude:    data.longitude,
        storeName:    `${data.companyName || data.name} Main Branch`,
      };

      console.log("[RegisterPage] Sending POST /company/profile with payload:", { ...payload, password: "***" });

      saveRegistrationDraft({
        name:     data.name,
        email:    data.email,
        password: data.password,
        intent:   data.intent ?? "sell",
      });

      const response = await api.post<{ companyId: string; email: string; companyName: string }>(
        "/company/profile",
        payload,
      );

      console.log("[RegisterPage] Registration response:", response);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "barea_session",
          JSON.stringify({
            companyId:   response.companyId,
            email:       response.email,
            companyName: response.companyName,
            intent:      data.intent,
            industry:    data.industry,
            city:        data.city,
            latitude:    data.latitude,
            longitude:   data.longitude,
          }),
        );
        console.log("[RegisterPage] Session stored in localStorage:", response.companyId);
      }

      clearRegistrationDraft();
      alert("Registration successful! Primary location store created.");
      router.push("/home");

    } catch (error) {
      console.error("[RegisterPage] Registration failed:", error);
      const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
      const message = isNetworkError
        ? "Cannot connect to server. Ensure Java backend is running on port 8080."
        : error instanceof Error ? error.message : "Registration failed.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Card className="mx-auto w-full max-w-4xl rounded-2xl border-border shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3 px-6 pb-4 pt-8 text-center sm:px-10 sm:pt-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              B_Area Marketplace
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">
            Register Your Company
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Step {step} of 2 — Set up identity, location & branches
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-10 sm:pb-10">
          <StepIndicator currentStep={step} totalSteps={2} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              {/* STEP 1: Identity Credentials */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founder / Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Apex Steel Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="it_software">IT & Software</SelectItem>
                            <SelectItem value="steel_metals">Steel & Metals</SelectItem>
                            <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                            <SelectItem value="electronics">Electronics & Hardware</SelectItem>
                            <SelectItem value="chemicals">Chemicals & Plastics</SelectItem>
                            <SelectItem value="logistics">Logistics & Freight</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 2: Location & Primary Store Branch */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <MapPin className="w-5 h-5" />
                      <span>Primary Branch Location (GPS Geolocation)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      B_Area uses location-aware spatial search. We will automatically create your first store branch with GPS coordinates.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
                        {isLocating ? "Locating GPS..." : "Detect My Location"}
                      </Button>

                      {locationStatus && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {locationStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary City</FormLabel>
                        <FormControl>
                          <Input placeholder="Bangalore, Mumbai, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Intent</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sell">Sell Products & Services</SelectItem>
                            <SelectItem value="buy">Buy & Procure Supplies</SelectItem>
                            <SelectItem value="network">Network & Partner</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Stepper Navigation */}
              <div className="flex justify-between pt-4 border-t border-border">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1"
                  >
                    Next Location Step <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1"
                  >
                    {isSubmitting ? (
                      "Creating Account & Primary Store..."
                    ) : (
                      <>
                        Complete Registration{" "}
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
