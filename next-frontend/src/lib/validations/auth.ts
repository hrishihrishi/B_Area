import * as z from "zod";

// Step 1: Account Credentials
const baseStepOneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
});

export const stepOneSchema = baseStepOneSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Step 2: Company Details
export const stepTwoSchema = z.object({
  businessType: z.string().min(1, "Please select a business type"),
  industry: z.string().min(1, "Please select an industry"),
  locatedIn: z.string().min(1, "Please select a country"),
});

// Step 3: Intent / Role
export const stepThreeSchema = z.object({
  intent: z.enum(["network", "sell", "buy"], {
    required_error: "Please select your primary intent",
  }),
});

// Combined Schema for Submission
export const registrationSchema = z.object({
  ...baseStepOneSchema.shape,
  ...stepTwoSchema.shape,
  ...stepThreeSchema.shape,
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
