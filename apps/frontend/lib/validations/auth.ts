import { z } from "zod";

// Login schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required"),
});

// Signup schema - more strict validation
export const signupSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
         .string()
         .trim()
         .toLowerCase()
         .email("Please enter a valid email"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(16,"Password is too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(["STUDENT", "TEACHER"], {
         message: "Please select a role" 
    }),
    // Crazy things i am coming to know man THE HONEYPOT: Bots will fill this, humans won't.It must be an empty string to pass validation.
    website: z.string().max(0, { message: "Bot detected" }).optional()
});

// Types inferred from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
