"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
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
  const router = useRouter();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      // businessType: "",
      // industry: "",
      // locatedIn: "",
      intent: undefined,
    },
    mode: "onChange",
  });

  // Validate the current step fields before progressing
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger([
        "name",
        "email",
        "password",
        "confirmPassword",
      ]);
    }
    // else if (step === 2) {
    //   isValid = await form.trigger(["businessType", "industry", "locatedIn"]);
    // }

    if (isValid) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        intent: data.intent,
        businessType: data.businessType ?? "",
        industry: data.industry ?? "",
        locatedIn: data.locatedIn ?? "",
      };

      saveRegistrationDraft({
        name: data.name,
        email: data.email,
        password: data.password,
        intent: data.intent,
      });

      await api.post("/company/profile", payload);
      clearRegistrationDraft();

      alert("Registration successful!");
      router.push("/my-company");
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Card className="mx-auto w-full max-w-7xl rounded-2xl border-border shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3 px-6 pb-4 pt-8 text-center sm:px-10 sm:pt-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              B_Area
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">
            Create your Business Account
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Join the verified B2B network to discover and trade.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-10 sm:pb-10">
          <StepIndicator currentStep={step} totalSteps={2} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
              {/* PAGE 1: Personal Credentials */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
              )}

              {/* PAGE 2: Business Profile
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manufacturer">
                              Manufacturer
                            </SelectItem>
                            <SelectItem value="distributor">
                              Wholesaler / Distributor
                            </SelectItem>
                            <SelectItem value="service_provider">
                              Service Provider
                            </SelectItem>
                            <SelectItem value="agency">
                              Agency / Firm
                            </SelectItem>
                            <SelectItem value="retailer">Retailer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="it_software">
                              IT & Software Services
                            </SelectItem>
                            <SelectItem value="textiles">
                              Textiles & Apparel
                            </SelectItem>
                            <SelectItem value="electronics">
                              Electronics & Hardware
                            </SelectItem>
                            <SelectItem value="chemicals">
                              Chemicals & Plastics
                            </SelectItem>
                            <SelectItem value="logistics">
                              Logistics & Freight
                            </SelectItem>
                            <SelectItem value="machinery">
                              Industrial Machinery
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locatedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country / Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="AE">
                              United Arab Emirates
                            </SelectItem>
                            <SelectItem value="SG">Singapore</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )} */}

              {/* PAGE 2: Platform Intent */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <FormField
                    control={form.control}
                    name="intent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am primarily here to:</FormLabel>
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
                            <SelectItem value="network">
                              Network & Build Connections
                            </SelectItem>
                            <SelectItem value="sell">
                              Sell Products / Services
                            </SelectItem>
                            <SelectItem value="buy">
                              Buy / Procure Supplies
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Stepper Navigation Actions */}
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
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1"
                  >
                    {isSubmitting ? (
                      "Creating Account..."
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
