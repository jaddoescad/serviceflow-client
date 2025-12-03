import { z } from "zod";

// Common field schemas
export const nameSchema = z.string().min(1, "Name is required").max(100, "Name is too long");
export const optionalNameSchema = z.string().max(100, "Name is too long").optional().default("");

export const emailSchema = z.string().email("Invalid email address");
export const optionalEmailSchema = z.string().email("Invalid email address").or(z.literal("")).optional().default("");

export const phoneSchema = z.string().min(10, "Phone number is too short").max(20, "Phone number is too long");
export const optionalPhoneSchema = z.string().max(20, "Phone number is too long").optional().default("");

export const urlSchema = z.string().url("Invalid URL");
export const optionalUrlSchema = z.string().url("Invalid URL").or(z.literal("")).optional().default("");

export const dateSchema = z.string().min(1, "Date is required");
export const timeSchema = z.string().min(1, "Time is required");

export const currencySchema = z.number().nonnegative("Amount must be positive").multipleOf(0.01, "Amount can only have 2 decimal places");

// Contact validation
export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: optionalNameSchema,
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// Address validation
export const addressSchema = z.object({
  addressLine1: z.string().optional().default(""),
  addressLine2: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default(""),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

// Settings validation
export const companySettingsSchema = z.object({
  name: nameSchema,
  shortName: optionalNameSchema,
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  website: optionalUrlSchema,
  address: addressSchema.optional(),
});

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;
