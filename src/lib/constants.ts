export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  ADMISSIONS: '/admissions',
  FACULTY: '/faculty',
  DEPARTMENTS: '/departments',
  GALLERY: '/gallery',
  HOSTELS: '/hostels',
  HOSPITAL: '/hospital',
  CONTACT: '/contact',
  NOTICES: '/notices',
} as const;

export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];

export const ADMIN_ROUTES = {
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PAGES: '/admin/pages',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_NOTICES: '/admin/notices',
  ADMIN_FACULTY: '/admin/faculty',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_HOSTELS: '/admin/hostels',
  ADMIN_HOSPITAL: '/admin/hospital',
  ADMIN_ADMISSIONS: '/admin/admissions',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_THEME: '/admin/theme',
  ADMIN_BACKUPS: '/admin/backups',
} as const;

export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES];

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  MEDIA_MANAGER: 'MEDIA_MANAGER',
  SEO_MANAGER: 'SEO_MANAGER',
  ADMISSION_STAFF: 'ADMISSION_STAFF',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_PERMISSIONS = {
  CAN_MANAGE_USERS: 'CAN_MANAGE_USERS',
  CAN_MANAGE_SETTINGS: 'CAN_MANAGE_SETTINGS',
  CAN_MANAGE_PAGES: 'CAN_MANAGE_PAGES',
  CAN_MANAGE_MEDIA: 'CAN_MANAGE_MEDIA',
  CAN_MANAGE_NOTICES: 'CAN_MANAGE_NOTICES',
  CAN_MANAGE_FACULTY: 'CAN_MANAGE_FACULTY',
  CAN_MANAGE_DEPARTMENTS: 'CAN_MANAGE_DEPARTMENTS',
  CAN_MANAGE_ADMISSIONS: 'CAN_MANAGE_ADMISSIONS',
  CAN_MANAGE_HOSTELS: 'CAN_MANAGE_HOSTELS',
  CAN_MANAGE_HOSPITAL: 'CAN_MANAGE_HOSPITAL',
  CAN_MANAGE_SEO: 'CAN_MANAGE_SEO',
  CAN_PUBLISH_CONTENT: 'CAN_PUBLISH_CONTENT',
} as const;

export type UserPermission = typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS];

export const PLATFORM_MODULES = {
  PAGES: 'PAGES',
  NOTICES: 'NOTICES',
  FACULTY: 'FACULTY',
  DEPARTMENTS: 'DEPARTMENTS',
  GALLERY: 'GALLERY',
  HOSTELS: 'HOSTELS',
  HOSPITAL: 'HOSPITAL',
  ADMISSIONS: 'ADMISSIONS',
  SEO: 'SEO',
  ANALYTICS: 'ANALYTICS',
  MEDIA: 'MEDIA',
  SETTINGS: 'SETTINGS',
} as const;

export type PlatformModule = typeof PLATFORM_MODULES[keyof typeof PLATFORM_MODULES];

export const HOMEPAGE_PRESETS = {
  MEDICAL_COLLEGE: 'MEDICAL_COLLEGE',
  ENGINEERING_COLLEGE: 'ENGINEERING_COLLEGE',
  UNIVERSITY: 'UNIVERSITY',
  SCHOOL: 'SCHOOL',
} as const;

export type HomepagePreset = typeof HOMEPAGE_PRESETS[keyof typeof HOMEPAGE_PRESETS];

export const THEME_PRESETS = {
  MEDICAL: 'MEDICAL',
  ENGINEERING: 'ENGINEERING',
  UNIVERSITY: 'UNIVERSITY',
  SCHOOL: 'SCHOOL',
  MODERN_DARK: 'MODERN_DARK',
} as const;

export type ThemePreset = typeof THEME_PRESETS[keyof typeof THEME_PRESETS];

export const NOTICE_CATEGORIES = {
  ADMISSION: 'ADMISSION',
  EXAMINATION: 'EXAMINATION',
  ACADEMIC: 'ACADEMIC',
  RESULT: 'RESULT',
  HOLIDAY: 'HOLIDAY',
  TENDER: 'TENDER',
  GENERAL: 'GENERAL',
} as const;

export type NoticeCategory = typeof NOTICE_CATEGORIES[keyof typeof NOTICE_CATEGORIES];

export const GALLERY_CATEGORIES = {
  EVENTS: 'EVENTS',
  SEMINARS: 'SEMINARS',
  LABS: 'LABS',
  SPORTS: 'SPORTS',
  HOSTEL: 'HOSTEL',
  HOSPITAL: 'HOSPITAL',
  CAMPUS: 'CAMPUS',
} as const;

export type GalleryCategory = typeof GALLERY_CATEGORIES[keyof typeof GALLERY_CATEGORIES];

export const HOSTEL_TYPES = {
  BOYS: 'BOYS',
  GIRLS: 'GIRLS',
  INTERNATIONAL: 'INTERNATIONAL',
  STAFF: 'STAFF',
} as const;

export type HostelType = typeof HOSTEL_TYPES[keyof typeof HOSTEL_TYPES];

export const HOSPITAL_CATEGORIES = {
  OPD: 'OPD',
  IPD: 'IPD',
  SURGERY: 'SURGERY',
  LABORATORY: 'LABORATORY',
  EMERGENCY: 'EMERGENCY',
  PHARMACY: 'PHARMACY',
} as const;

export type HospitalCategory = typeof HOSPITAL_CATEGORIES[keyof typeof HOSPITAL_CATEGORIES];

export const STATUS_TYPES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const;

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];

export const SEO_DEFAULTS = {
  DEFAULT_TITLE: 'Institutional CMS Platform - Powered by Next.js & Supabase',
  DEFAULT_DESCRIPTION: 'A scalable white-label institutional CMS platform built with Next.js, TypeScript, and Supabase.',
} as const;

export type SeoDefaults = typeof SEO_DEFAULTS;