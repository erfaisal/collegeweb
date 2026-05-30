import { z } from "zod";

// --- Admissions ---
export const admissionInquirySchema = z.object({
  student_name: z.string().trim()
    .min(2, "Student name must be at least 2 characters long.")
    .max(255, "Student name must not exceed 255 characters."),
  email: z.string().trim()
    .email("Invalid email address.")
    .max(255, "Email must not exceed 255 characters."),
  phone: z.string().trim()
    .min(7, "Phone number must be at least 7 characters long.")
    .max(20, "Phone number must not exceed 20 characters.")
    .optional(), // If provided, must meet min/max. Undefined is allowed. An empty string "" will fail min(7).
  course: z.string().trim()
    .min(1, "Course is required.")
    .max(255, "Course must not exceed 255 characters."),
  message: z.string().trim()
    .max(1000, "Message must not exceed 1000 characters.")
    .optional(),
}).strict();

export type AdmissionInquiryInput = z.infer<typeof admissionInquirySchema>;

// --- Contact ---
export const contactInquirySchema = z.object({
  name: z.string().trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(255, "Name must not exceed 255 characters."),
  email: z.string().trim()
    .email("Invalid email address.")
    .max(255, "Email must not exceed 255 characters."),
  phone: z.string().trim()
    .min(7, "Phone number must be at least 7 characters long.")
    .max(20, "Phone number must not exceed 20 characters.")
    .optional(), // If provided, must meet min/max. Undefined is allowed. An empty string "" will fail min(7).
  subject: z.string().trim()
    .min(1, "Subject is required.")
    .max(255, "Subject must not exceed 255 characters."),
  message: z.string().trim()
    .min(1, "Message is required.")
    .max(1000, "Message must not exceed 1000 characters."),
}).strict();

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

// --- Faculty ---
export const facultySchema = z.object({
  name: z.string().trim()
    .min(2, "Faculty name must be at least 2 characters long.")
    .max(255, "Faculty name must not exceed 255 characters."),
  designation: z.string().trim()
    .min(2, "Designation must be at least 2 characters long.")
    .max(255, "Designation must not exceed 255 characters."),
  department: z.string().trim()
    .min(1, "Department is required.")
    .max(255, "Department must not exceed 255 characters."),
  qualification: z.string().trim()
    .min(1, "Qualification is required.")
    .max(255, "Qualification must not exceed 255 characters."),
  email: z.string().trim()
    .email("Invalid email address.")
    .max(255, "Email must not exceed 255 characters.")
    .optional(),
  phone: z.string().trim()
    .min(7, "Phone number must be at least 7 characters long.")
    .max(20, "Phone number must not exceed 20 characters.")
    .optional(),
  experience_years: z.number()
    .int("Experience years must be an integer.")
    .min(0, "Experience years cannot be negative.")
    .max(100, "Experience years must not exceed 100.")
    .optional(),
}).strict();

export type FacultyInput = z.infer<typeof facultySchema>;

// --- Departments ---
export const departmentSchema = z.object({
  name: z.string().trim()
    .min(2, "Department name must be at least 2 characters long.")
    .max(255, "Department name must not exceed 255 characters."),
  slug: z.string().trim()
    .min(2, "Slug must be at least 2 characters long.")
    .max(255, "Slug must not exceed 255 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
  short_description: z.string().trim()
    .max(500, "Short description must not exceed 500 characters.")
    .optional(),
  description: z.string().trim()
    .max(5000, "Description must not exceed 5000 characters.")
    .optional(),
}).strict();

export type DepartmentInput = z.infer<typeof departmentSchema>;

// --- Notices ---
export const noticeSchema = z.object({
  title: z.string().trim()
    .min(2, "Title must be at least 2 characters long.")
    .max(255, "Title must not exceed 255 characters."),
  slug: z.string().trim()
    .min(2, "Slug must be at least 2 characters long.")
    .max(255, "Slug must not exceed 255 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
  short_description: z.string().trim()
    .max(500, "Short description must not exceed 500 characters.")
    .optional(),
  publish_date: z.coerce.date({ invalid_type_error: "Publish date must be a valid date format." }), // Handles string (ISO 8601) or Date objects
}).strict();

export type NoticeInput = z.infer<typeof noticeSchema>;

// --- Pages ---
export const pageSchema = z.object({
  title: z.string().trim()
    .min(2, "Title must be at least 2 characters long.")
    .max(255, "Title must not exceed 255 characters."),
  slug: z.string().trim()
    .min(2, "Slug must be at least 2 characters long.")
    .max(255, "Slug must not exceed 255 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
  content: z.string() // Content typically is rich text (HTML/Markdown), so no trim by default.
    .max(100000, "Content must not exceed 100,000 characters.")
    .optional(),
}).strict();

export type PageInput = z.infer<typeof pageSchema>;

// --- Navigation ---
export const navigationSchema = z.object({
  label: z.string().trim()
    .min(1, "Label is required.")
    .max(100, "Label must not exceed 100 characters."),
  href: z.string().trim()
    .min(1, "Href is required.")
    .max(255, "Href must not exceed 255 characters.")
    .regex(/^(?:https?:\/\/[^\s/$.?#].[^\s]*|\/[^\s]*)$/, "Href must be a valid URL (http/https) or a relative path (e.g., /about)."),
}).strict();

export type NavigationInput = z.infer<typeof navigationSchema>;

// --- SEO ---
export const seoSchema = z.object({
  title: z.string().trim()
    .min(5, "SEO title should be at least 5 characters long.")
    .max(60, "SEO title should not exceed 60 characters.")
    .optional(),
  description: z.string().trim()
    .min(10, "SEO description should be at least 10 characters long.")
    .max(160, "SEO description should not exceed 160 characters.")
    .optional(),
  canonical_url: z.string().trim()
    .url("Invalid canonical URL format.")
    .max(255, "Canonical URL must not exceed 255 characters.")
    .optional(),
}).strict();

export type SEOInput = z.infer<typeof seoSchema>;

// --- Theme ---
export const themeSchema = z.object({
  primary_color: z.string().trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid primary color format. Expected hex code (e.g., #RRGGBB or #RGB).")
    .optional(),
  secondary_color: z.string().trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid secondary color format. Expected hex code (e.g., #RRGGBB or #RGB).")
    .optional(),
  accent_color: z.string().trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid accent color format. Expected hex code (e.g., #RRGGBB or #RGB).")
    .optional(),
}).strict();

export type ThemeInput = z.infer<typeof themeSchema>;

// --- Settings ---
export const siteSettingsSchema = z.object({
  site_name: z.string().trim()
    .min(2, "Site name must be at least 2 characters long.")
    .max(255, "Site name must not exceed 255 characters."),
  email: z.string().trim()
    .email("Invalid email address.")
    .max(255, "Email must not exceed 255 characters.")
    .optional(),
  phone: z.string().trim()
    .min(7, "Phone number must be at least 7 characters long.")
    .max(20, "Phone number must not exceed 20 characters.")
    .optional(),
}).strict();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;