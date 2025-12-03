import { z } from "zod";

export const communicationMethodSchema = z.enum(["both", "email", "sms", "none"]);

export const scheduleDealFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().default(""),
  email: z.string().email("Invalid email address").or(z.literal("")).optional().default(""),
  phone: z.string().optional().default(""),
  leadSource: z.string().optional().default(""),
  salesperson: z.string().optional().default(""),
  projectManager: z.string().optional().default(""),
  disableDrips: z.boolean().default(false),
  assignedTo: z.string().optional().default(""),
  eventColor: z.string().default("#3B82F6"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  communicationMethod: communicationMethodSchema.default("none"),
  notes: z.string().optional().default(""),
}).refine(
  (data) => {
    if (!data.scheduledDate || !data.startTime || !data.endTime) return true;

    // Compare times as strings (HH:mm format)
    return data.startTime !== data.endTime;
  },
  {
    message: "End time must be different from start time",
    path: ["endTime"],
  }
);

export const addressFormSchema = z.object({
  addressLine1: z.string().optional().default(""),
  addressLine2: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default(""),
});

export type ScheduleDealFormValues = z.infer<typeof scheduleDealFormSchema>;
export type AddressFormValues = z.infer<typeof addressFormSchema>;

// Combined schema for full form validation
export const fullScheduleDealSchema = scheduleDealFormSchema.merge(
  z.object({
    address: addressFormSchema.optional(),
  })
);

export type FullScheduleDealFormValues = z.infer<typeof fullScheduleDealSchema>;
