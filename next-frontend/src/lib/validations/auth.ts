import * as z from "zod";

// Step 1: Account Credentials
const baseStepOneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Company Name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
});

export const stepOneSchema = baseStepOneSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
);

// Step 2: Location & Intent
export const stepTwoSchema = z.object({
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  intent: z.enum(["network", "sell", "buy"], {
    required_error: "Please select your primary intent",
  }),
});

// Combined Schema for Submission
export const registrationSchema = z.object({
  ...baseStepOneSchema.shape,
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessType: z.string().optional(),
  locatedIn: z.string().optional(),
  intent: z.enum(["network", "sell", "buy"]).optional(),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
