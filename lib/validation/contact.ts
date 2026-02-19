import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter a valid name.")
    .max(80, "Please enter a valid name."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(120, "Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(20, "Message must be between 20 and 5000 characters.")
    .max(5000, "Message must be between 20 and 5000 characters."),
  company: z.string().trim().max(120).optional().default("")
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormData = z.output<typeof contactFormSchema>;
