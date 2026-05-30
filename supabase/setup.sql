-- ================================================================================================
-- Supabase Production-Grade Setup for White-Label Institutional CMS Platform
--
-- This script sets up the database schema, including tables, relationships, indexes,
-- triggers, Row Level Security (RLS) policies, and Storage buckets/policies.
-- It's designed for scalability, security, and future multi-tenant compatibility.
--
-- Tech Stack: Supabase PostgreSQL, Next.js 14, TypeScript, RBAC architecture
-- Supported Institutions: Engineering Colleges, Medical Colleges, Universities, Schools, Hospitals
-- ================================================================================================

-- Exit on any error
\set ON_ERROR_STOP true

-- ================================================================================================
-- 1. Extensions
--    Enabling PostgreSQL extensions for UUID generation, network requests, and performance monitoring.
-- ================================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net"; -- For potential future webhooks or external API calls
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For performance monitoring

-- ================================================================================================
-- 2. Utility Functions & Triggers
--    Reusable functions for common database operations, such as updating 'updated_at' timestamps.
-- ================================================================================================

-- Function to update the 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if a user is an admin
-- This assumes that 'admin' is a role name in the 'roles' table
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = is_admin.user_id AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = has_permission.user_id AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================================
-- 3. Core CMS Tables
--    Fundamental tables for managing website content and structure.
-- ================================================================================================

-- Table for institutions (for future multi-tenant compatibility)
CREATE TABLE public.institutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    contact_email TEXT,
    phone_number TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_institutions_slug ON public.institutions (slug);
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.institutions IS 'Represents individual institutions managed by the platform.';

-- Table for modules/templates
CREATE TABLE public.modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL, -- e.g., 'template', 'component', 'section'
    configuration JSONB DEFAULT '{}'::jsonb NOT NULL, -- Flexible JSON for module settings
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.modules IS 'Defines reusable modules or templates for page content and structure.';

-- Table for pages
CREATE TABLE public.pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- SEO-friendly URL segment
    content JSONB DEFAULT '{}'::jsonb NOT NULL, -- Flexible content structure (e.g., block editor data)
    parent_id uuid REFERENCES public.pages(id) ON DELETE SET NULL, -- For hierarchical pages
    module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL, -- Template/module used for the page
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    publish_date TIMESTAMPTZ,
    visibility TEXT DEFAULT 'public' NOT NULL, -- 'public', 'private', 'draft'
    display_order INT DEFAULT 0 NOT NULL,
    featured_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_pages_slug_no_slash CHECK (slug !~ '/'),
    UNIQUE (institution_id, slug) -- Ensure unique slug per institution
);
CREATE INDEX idx_pages_institution_id ON public.pages (institution_id);
CREATE INDEX idx_pages_slug ON public.pages (slug);
CREATE INDEX idx_pages_is_published ON public.pages (is_published);
CREATE INDEX idx_pages_publish_date ON public.pages (publish_date);
CREATE INDEX idx_pages_display_order ON public.pages (display_order);
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.pages IS 'Stores all website pages with their content and metadata.';

-- Table for homepage sections
CREATE TABLE public.homepage_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'hero', 'about_us', 'gallery', 'call_to_action'
    content JSONB DEFAULT '{}'::jsonb NOT NULL, -- Flexible content for the section
    display_order INT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL, -- Optional module for the section
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, title)
);
CREATE INDEX idx_homepage_sections_institution_id ON public.homepage_sections (institution_id);
CREATE INDEX idx_homepage_sections_display_order ON public.homepage_sections (display_order);
CREATE INDEX idx_homepage_sections_is_visible ON public.homepage_sections (is_visible);
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.homepage_sections IS 'Manages dynamic sections displayed on the homepage.';

-- Table for navigation items
CREATE TABLE public.navigation_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    url TEXT, -- External URL or path to an internal page
    page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL, -- Link to an internal page
    parent_id uuid REFERENCES public.navigation_items(id) ON DELETE SET NULL, -- For dropdown menus
    display_order INT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    menu_location TEXT DEFAULT 'main' NOT NULL, -- e.g., 'main', 'footer', 'sidebar'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_navigation_items_institution_id ON public.navigation_items (institution_id);
CREATE INDEX idx_navigation_items_display_order ON public.navigation_items (display_order);
CREATE INDEX idx_navigation_items_is_visible ON public.navigation_items (is_visible);
CREATE INDEX idx_navigation_items_menu_location ON public.navigation_items (menu_location);
CREATE TRIGGER update_navigation_items_updated_at BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.navigation_items IS 'Defines website navigation menus and their links.';

-- Table for SEO Metadata (can be linked to pages or other content entities)
CREATE TABLE public.seo_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL, -- e.g., 'page', 'notice', 'department'
    entity_id uuid NOT NULL, -- Foreign key to the respective entity table
    title TEXT,
    description TEXT,
    keywords TEXT, -- Comma-separated
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    og_type TEXT,
    twitter_card TEXT,
    twitter_site TEXT,
    twitter_creator TEXT,
    robots_index BOOLEAN DEFAULT TRUE NOT NULL,
    robots_follow BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (entity_type, entity_id, institution_id) -- Ensure unique SEO per entity per institution
);
CREATE INDEX idx_seo_metadata_entity_id ON public.seo_metadata (entity_id);
CREATE INDEX idx_seo_metadata_institution_id ON public.seo_metadata (institution_id);
CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.seo_metadata IS 'Stores search engine optimization metadata for various content entities.';

-- Table for site-wide settings
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL, -- e.g., 'site_name', 'analytics_code', 'contact_email'
    value JSONB DEFAULT '{}'::jsonb NOT NULL, -- Stored as JSONB for flexible data types
    setting_type TEXT DEFAULT 'general' NOT NULL, -- 'general', 'social_media', 'integration'
    is_public BOOLEAN DEFAULT FALSE NOT NULL, -- Indicates if the setting can be publicly exposed
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, key)
);
CREATE INDEX idx_site_settings_institution_id ON public.site_settings (institution_id);
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.site_settings IS 'Stores global and institution-specific site configurations.';

-- Table for themes
CREATE TABLE public.themes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    version TEXT DEFAULT '1.0.0' NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL, -- Only one theme can be active per institution
    color_palette JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g., { "primary": "#...", "secondary": "#..." }
    typography JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g., { "font_family": "Roboto", "h1_size": "3rem" }
    branding JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g., { "logo_url": "...", "favicon_url": "..." }
    dark_mode_settings JSONB DEFAULT '{}'::jsonb NOT NULL, -- Specific settings for dark mode
    css_variables TEXT, -- Custom CSS variables
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.themes IS 'Defines visual themes and styling options for the CMS.';

-- Table to link institutions to themes
CREATE TABLE public.institution_themes (
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    theme_id uuid REFERENCES public.themes(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (institution_id, theme_id),
    CONSTRAINT unique_active_theme_per_institution UNIQUE (institution_id, is_active) WHERE is_active = TRUE
);
CREATE TRIGGER update_institution_themes_updated_at BEFORE UPDATE ON public.institution_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.institution_themes IS 'Links themes to institutions and specifies the active theme.';


-- ================================================================================================
-- 4. Content Tables
--    Tables for specific content types like notices, galleries, faculty, etc.
-- ================================================================================================

-- Table for departments (general purpose, for colleges/hospitals)
CREATE TABLE public.departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'college', 'hospital', 'school', 'university'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, slug)
);
CREATE INDEX idx_departments_institution_id ON public.departments (institution_id);
CREATE INDEX idx_departments_slug ON public.departments (slug);
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.departments IS 'Manages departments within various institutional contexts.';

-- Table for notices/announcements
CREATE TABLE public.notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    publish_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expiry_date TIMESTAMPTZ,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    attachment_url TEXT, -- URL to associated media file
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, slug)
);
CREATE INDEX idx_notices_institution_id ON public.notices (institution_id);
CREATE INDEX idx_notices_slug ON public.notices (slug);
CREATE INDEX idx_notices_publish_date ON public.notices (publish_date);
CREATE INDEX idx_notices_is_featured ON public.notices (is_featured);
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.notices IS 'Stores institutional notices and announcements.';

-- Table for gallery images
CREATE TABLE public.gallery_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    category TEXT, -- e.g., 'campus', 'event', 'graduation'
    display_order INT DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_gallery_images_institution_id ON public.gallery_images (institution_id);
CREATE INDEX idx_gallery_images_category ON public.gallery_images (category);
CREATE INDEX idx_gallery_images_display_order ON public.gallery_images (display_order);
CREATE INDEX idx_gallery_images_is_featured ON public.gallery_images (is_featured);
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.gallery_images IS 'Manages images for institution galleries.';

-- Table for faculty members
CREATE TABLE public.faculty_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    bio TEXT,
    image_url TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    qualification TEXT,
    research_interests TEXT,
    profile_page_slug TEXT UNIQUE, -- for individual faculty pages
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, email)
);
CREATE INDEX idx_faculty_members_institution_id ON public.faculty_members (institution_id);
CREATE INDEX idx_faculty_members_department_id ON public.faculty_members (department_id);
CREATE INDEX idx_faculty_members_email ON public.faculty_members (email);
CREATE INDEX idx_faculty_members_is_featured ON public.faculty_members (is_featured);
CREATE TRIGGER update_faculty_members_updated_at BEFORE UPDATE ON public.faculty_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.faculty_members IS 'Stores information about faculty members across institutions.';

-- Table for hostel facilities
CREATE TABLE public.hostel_facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    capacity INT,
    type TEXT NOT NULL, -- 'boys', 'girls', 'coed'
    location TEXT,
    amenities JSONB DEFAULT '[]'::jsonb NOT NULL, -- List of amenities
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, name)
);
CREATE INDEX idx_hostel_facilities_institution_id ON public.hostel_facilities (institution_id);
CREATE INDEX idx_hostel_facilities_type ON public.hostel_facilities (type);
CREATE TRIGGER update_hostel_facilities_updated_at BEFORE UPDATE ON public.hostel_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.hostel_facilities IS 'Details institutional hostel facilities.';

-- Table for hospital departments (specific to hospital contexts)
CREATE TABLE public.hospital_departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    head_of_department_id uuid REFERENCES public.faculty_members(id) ON DELETE SET NULL, -- If HOD is a faculty member
    services TEXT, -- Comma-separated or JSONB list of services
    contact_info TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (institution_id, slug)
);
CREATE INDEX idx_hospital_departments_institution_id ON public.hospital_departments (institution_id);
CREATE INDEX idx_hospital_departments_slug ON public.hospital_departments (slug);
CREATE TRIGGER update_hospital_departments_updated_at BEFORE UPDATE ON public.hospital_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.hospital_departments IS 'Specific department information for hospitals.';


-- ================================================================================================
-- 5. Admissions & Contact Tables
--    Tables for managing inquiries and communications.
-- ================================================================================================

-- Table for admission inquiries
CREATE TABLE public.admission_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course_of_interest TEXT,
    message TEXT NOT NULL,
    inquiry_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'contacted', 'resolved', 'spam'
    source TEXT, -- e.g., 'website', 'email', 'phone'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_admission_inquiries_institution_id ON public.admission_inquiries (institution_id);
CREATE INDEX idx_admission_inquiries_email ON public.admission_inquiries (email);
CREATE INDEX idx_admission_inquiries_status ON public.admission_inquiries (status);
CREATE INDEX idx_admission_inquiries_inquiry_date ON public.admission_inquiries (inquiry_date);
CREATE TRIGGER update_admission_inquiries_updated_at BEFORE UPDATE ON public.admission_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.admission_inquiries IS 'Records all admission inquiries received.';

-- Table for general contact inquiries
CREATE TABLE public.contact_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    inquiry_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'contacted', 'resolved', 'spam'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_contact_inquiries_institution_id ON public.contact_inquiries (institution_id);
CREATE INDEX idx_contact_inquiries_email ON public.contact_inquiries (email);
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries (status);
CREATE INDEX idx_contact_inquiries_inquiry_date ON public.contact_inquiries (inquiry_date);
CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.contact_inquiries IS 'Records all general contact inquiries received.';

-- ================================================================================================
-- 6. Media Tables
--    Table for managing uploaded media files.
-- ================================================================================================

CREATE TABLE public.media_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE, -- Can be null for shared global media
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Path in Supabase Storage
    mime_type TEXT NOT NULL,
    size BIGINT, -- Size in bytes
    alt_text TEXT,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    bucket_id TEXT NOT NULL, -- e.g., 'gallery', 'notices', 'branding'
    is_public BOOLEAN DEFAULT FALSE NOT NULL, -- Whether the file can be publicly accessed
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_media_files_institution_id ON public.media_files (institution_id);
CREATE INDEX idx_media_files_uploaded_by ON public.media_files (uploaded_by);
CREATE INDEX idx_media_files_bucket_id ON public.media_files (bucket_id);
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.media_files IS 'Stores metadata about uploaded media files.';

-- ================================================================================================
-- 7. Users & Security Tables (RBAC)
--    Tables for managing user roles, permissions, and security-related logs.
-- ================================================================================================

-- Table for roles
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'admin', 'editor', 'viewer', 'member'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.roles IS 'Defines user roles within the system.';

-- Table for permissions
CREATE TABLE public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'pages:create', 'notices:publish', 'settings:edit'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE public.permissions IS 'Defines granular permissions that can be assigned to roles.';

-- Junction table for user-role relationships
CREATE TABLE public.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE, -- Optional: for institution-specific roles
    PRIMARY KEY (user_id, role_id, institution_id), -- Composite PK
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles (role_id);
CREATE INDEX idx_user_roles_institution_id ON public.user_roles (institution_id);
COMMENT ON TABLE public.user_roles IS 'Links users to their assigned roles, optionally per institution.';

-- Junction table for role-permission relationships
CREATE TABLE public.role_permissions (
    role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions (role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions (permission_id);
COMMENT ON TABLE public.role_permissions IS 'Links roles to their granted permissions.';

-- Table for audit logs
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed the action
    institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity_type TEXT, -- e.g., 'pages', 'users', 'settings'
    entity_id uuid, -- ID of the entity affected (can be NULL for non-entity actions)
    old_value JSONB, -- Previous state of the entity (for UPDATEs)
    new_value JSONB, -- New state of the entity (for CREATEs/UPDATEs)
    severity TEXT DEFAULT 'INFO' NOT NULL, -- 'INFO', 'WARN', 'ERROR', 'CRITICAL'
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_institution_id ON public.audit_logs (institution_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs (entity_type);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs (timestamp);
COMMENT ON TABLE public.audit_logs IS 'Tracks all significant user and system actions for security and compliance.';

-- Table for notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE, -- Optional for institution-specific notifications
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL, -- 'info', 'warning', 'success', 'error'
    link TEXT, -- URL to navigate to when clicking the notification
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_institution_id ON public.notifications (institution_id);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at);
COMMENT ON TABLE public.notifications IS 'Stores user-specific notifications.';


-- ================================================================================================
-- 8. Operations Tables
--    Tables for managing backups and analytics events.
-- ================================================================================================

-- Table for backups (metadata)
CREATE TABLE public.backups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE, -- Can be null for full platform backups
    backup_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- URL to the backup file in storage
    size BIGINT, -- Size in bytes
    backup_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL, -- 'pending', 'completed', 'failed'
    backup_type TEXT DEFAULT 'database' NOT NULL, -- 'database', 'media', 'full'
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_backups_institution_id ON public.backups (institution_id);
CREATE INDEX idx_backups_backup_date ON public.backups (backup_date);
CREATE INDEX idx_backups_status ON public.backups (status);
COMMENT ON TABLE public.backups IS 'Records metadata about system backups.';

-- Table for analytics events
CREATE TABLE public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    event_name TEXT NOT NULL, -- e.g., 'page_view', 'admission_inquiry_submit', 'button_click'
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Null for anonymous users
    session_id TEXT, -- For tracking user sessions
    page_path TEXT, -- URL path where the event occurred
    event_data JSONB DEFAULT '{}'::jsonb NOT NULL, -- Flexible JSON for event-specific data
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_analytics_events_institution_id ON public.analytics_events (institution_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events (session_id);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events (timestamp);
COMMENT ON TABLE public.analytics_events IS 'Records various user and system events for analytics.';


-- ================================================================================================
-- 9. Row Level Security (RLS) Policies
--    Implementing fine-grained access control for data.
-- ================================================================================================

-- Enable RLS for all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------------------
-- RLS Policy: Public Read Access
-- For anon and authenticated roles on selected public-facing tables.
-- ------------------------------------------------------------------------------------------------

-- Institutions (read public info)
DROP POLICY IF EXISTS "Institutions are viewable by all." ON public.institutions;
CREATE POLICY "Institutions are viewable by all." ON public.institutions
FOR SELECT TO anon, authenticated USING (is_active = TRUE);

-- Pages (public, published pages)
DROP POLICY IF EXISTS "Published pages are viewable by all." ON public.pages;
CREATE POLICY "Published pages are viewable by all." ON public.pages
FOR SELECT TO anon, authenticated USING (is_published = TRUE AND deleted_at IS NULL);

-- Homepage Sections (public, visible sections)
DROP POLICY IF EXISTS "Visible homepage sections are viewable by all." ON public.homepage_sections;
CREATE POLICY "Visible homepage sections are viewable by all." ON public.homepage_sections
FOR SELECT TO anon, authenticated USING (is_visible = TRUE AND deleted_at IS NULL);

-- Navigation Items (public, visible items)
DROP POLICY IF EXISTS "Visible navigation items are viewable by all." ON public.navigation_items;
CREATE POLICY "Visible navigation items are viewable by all." ON public.navigation_items
FOR SELECT TO anon, authenticated USING (is_visible = TRUE AND deleted_at IS NULL);

-- SEO Metadata (public, linked to published entities)
DROP POLICY IF EXISTS "SEO metadata is viewable by all." ON public.seo_metadata;
CREATE POLICY "SEO metadata is viewable by all." ON public.seo_metadata
FOR SELECT TO anon, authenticated USING (
    (entity_type = 'page' AND EXISTS (SELECT 1 FROM public.pages p WHERE p.id = entity_id AND p.is_published = TRUE AND p.deleted_at IS NULL)) OR
    (entity_type = 'notice' AND EXISTS (SELECT 1 FROM public.notices n WHERE n.id = entity_id AND n.publish_date <= NOW() AND (n.expiry_date IS NULL OR n.expiry_date >= NOW()) AND n.is_archived = FALSE AND n.deleted_at IS NULL)) OR
    (entity_type = 'department' AND EXISTS (SELECT 1 FROM public.departments d WHERE d.id = entity_id AND d.is_active = TRUE AND d.deleted_at IS NULL)) OR
    (entity_type = 'hospital_department' AND EXISTS (SELECT 1 FROM public.hospital_departments hd WHERE hd.id = entity_id AND hd.is_active = TRUE AND hd.deleted_at IS NULL))
);

-- Site Settings (publicly exposed settings)
DROP POLICY IF EXISTS "Public site settings are viewable by all." ON public.site_settings;
CREATE POLICY "Public site settings are viewable by all." ON public.site_settings
FOR SELECT TO anon, authenticated USING (is_public = TRUE AND deleted_at IS NULL);

-- Themes (publicly active themes)
DROP POLICY IF EXISTS "Active themes are viewable by all." ON public.themes;
CREATE POLICY "Active themes are viewable by all." ON public.themes
FOR SELECT TO anon, authenticated USING (is_active = TRUE AND deleted_at IS NULL); -- Only globally active themes
-- Institution Themes
DROP POLICY IF EXISTS "Active institution themes are viewable by all." ON public.institution_themes;
CREATE POLICY "Active institution themes are viewable by all." ON public.institution_themes
FOR SELECT TO anon, authenticated USING (is_active = TRUE);

-- Notices (published notices)
DROP POLICY IF EXISTS "Published notices are viewable by all." ON public.notices;
CREATE POLICY "Published notices are viewable by all." ON public.notices
FOR SELECT TO anon, authenticated USING (
    publish_date <= NOW() AND
    (expiry_date IS NULL OR expiry_date >= NOW()) AND
    is_archived = FALSE AND
    deleted_at IS NULL
);

-- Gallery Images (publicly visible images)
DROP POLICY IF EXISTS "Gallery images are viewable by all." ON public.gallery_images;
CREATE POLICY "Gallery images are viewable by all." ON public.gallery_images
FOR SELECT TO anon, authenticated USING (deleted_at IS NULL); -- All gallery images are public by default

-- Faculty Members (publicly listed)
DROP POLICY IF EXISTS "Faculty members are viewable by all." ON public.faculty_members;
CREATE POLICY "Faculty members are viewable by all." ON public.faculty_members
FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

-- Departments (active departments)
DROP POLICY IF EXISTS "Departments are viewable by all." ON public.departments;
CREATE POLICY "Departments are viewable by all." ON public.departments
FOR SELECT TO anon, authenticated USING (is_active = TRUE AND deleted_at IS NULL);

-- Hostel Facilities (available facilities)
DROP POLICY IF EXISTS "Available hostel facilities are viewable by all." ON public.hostel_facilities;
CREATE POLICY "Available hostel facilities are viewable by all." ON public.hostel_facilities
FOR SELECT TO anon, authenticated USING (is_available = TRUE AND deleted_at IS NULL);

-- Hospital Departments (active departments)
DROP POLICY IF EXISTS "Hospital departments are viewable by all." ON public.hospital_departments;
CREATE POLICY "Hospital departments are viewable by all." ON public.hospital_departments
FOR SELECT TO anon, authenticated USING (is_active = TRUE AND deleted_at IS NULL);

-- Media Files (publicly marked files)
DROP POLICY IF EXISTS "Public media files are viewable by all." ON public.media_files;
CREATE POLICY "Public media files are viewable by all." ON public.media_files
FOR SELECT TO anon, authenticated USING (is_public = TRUE AND deleted_at IS NULL);


-- ------------------------------------------------------------------------------------------------
-- RLS Policy: Authenticated Admin Full Access
-- Full CRUD access for users with the 'admin' role.
-- ------------------------------------------------------------------------------------------------

-- Base admin policy to check if the current user is an admin for the relevant institution
-- or a global admin (institution_id IS NULL in user_roles)
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.institution_id IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_institution_admin(target_institution_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.institution_id = target_institution_id
    ) OR is_platform_admin(); -- Global admins can manage any institution
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for tables without institution_id (global configuration or lookup tables)
-- Roles, Permissions, Role Permissions, Modules, Global Themes
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN (SELECT relname FROM pg_class WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace AND relname IN ('roles', 'permissions', 'role_permissions', 'modules', 'themes'))
    LOOP
        EXECUTE FORMAT('DROP POLICY IF EXISTS "%I_admin_access" ON public.%I;', table_name, table_name);
        EXECUTE FORMAT('CREATE POLICY "%I_admin_access" ON public.%I FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());', table_name, table_name);
    END LOOP;
END $$;

-- Policy for tables with institution_id
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN (SELECT relname FROM pg_class WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace AND relname IN (
        'institutions', 'pages', 'homepage_sections', 'navigation_items', 'seo_metadata', 'site_settings',
        'institution_themes', 'notices', 'gallery_images', 'faculty_members', 'departments',
        'hostel_facilities', 'hospital_departments', 'admission_inquiries', 'contact_inquiries',
        'media_files', 'user_roles', 'audit_logs', 'notifications', 'backups', 'analytics_events'
    ))
    LOOP
        EXECUTE FORMAT('DROP POLICY IF EXISTS "%I_admin_access" ON public.%I;', table_name, table_name);
        EXECUTE FORMAT('CREATE POLICY "%I_admin_access" ON public.%I FOR ALL TO authenticated USING (is_institution_admin(institution_id)) WITH CHECK (is_institution_admin(institution_id));', table_name, table_name);
    END LOOP;
END $$;


-- Special RLS for user_roles (a user can manage their own roles if global admin, or for their institution)
-- This policy needs to be more granular or explicitly handled in the application.
-- For simplicity, 'admin' role means full access. For user_roles, an admin can assign roles.
DROP POLICY IF EXISTS "user_roles_admin_insert_update_delete" ON public.user_roles;
CREATE POLICY "user_roles_admin_insert_update_delete" ON public.user_roles
FOR ALL TO authenticated USING (is_institution_admin(institution_id)) WITH CHECK (is_institution_admin(institution_id));

DROP POLICY IF EXISTS "user_roles_read_self_and_admins" ON public.user_roles;
CREATE POLICY "user_roles_read_self_and_admins" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_institution_admin(institution_id));


-- ------------------------------------------------------------------------------------------------
-- Additional RLS considerations
-- ------------------------------------------------------------------------------------------------
-- Prevent authenticated users from reading audit logs unless they are admin.
DROP POLICY IF EXISTS "audit_logs_read_by_admin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_read_by_admin_only" ON public.audit_logs
FOR SELECT TO authenticated USING (is_institution_admin(institution_id));

-- Notifications: Users can read their own notifications
DROP POLICY IF EXISTS "notifications_read_by_owner" ON public.notifications;
CREATE POLICY "notifications_read_by_owner" ON public.notifications
FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_institution_admin(institution_id));


-- ================================================================================================
-- 10. Storage Buckets
--     Creating dedicated storage buckets for different media types.
-- ================================================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('gallery', 'gallery', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']), -- 5MB
    ('faculty', 'faculty', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 2MB
    ('notices', 'notices', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']), -- 10MB
    ('departments', 'departments', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 2MB
    ('hostels', 'hostels', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB
    ('hospital', 'hospital', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 5MB
    ('branding', 'branding', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']), -- 2MB
    ('media', 'media', FALSE, 20971520, ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']) -- 20MB, general media
ON CONFLICT (id) DO NOTHING;

-- ================================================================================================
-- 11. Secure Storage Policies
--     Implementing RLS for storage buckets.
-- ================================================================================================

-- Policy for 'gallery' bucket
DROP POLICY IF EXISTS "Public read access for gallery images" ON storage.objects;
CREATE POLICY "Public read access for gallery images" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins can upload/update/delete gallery images" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete gallery images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'gallery' AND is_platform_admin()) -- Requires a global admin for now, could be extended to institution_admin if files are per institution
WITH CHECK (bucket_id = 'gallery' AND is_platform_admin());

-- Policy for 'faculty' bucket
DROP POLICY IF EXISTS "Public read access for faculty images" ON storage.objects;
CREATE POLICY "Public read access for faculty images" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'faculty');

DROP POLICY IF EXISTS "Admins can upload/update/delete faculty images" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete faculty images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'faculty' AND is_platform_admin())
WITH CHECK (bucket_id = 'faculty' AND is_platform_admin());

-- Policy for 'notices' bucket
DROP POLICY IF EXISTS "Public read access for notice attachments" ON storage.objects;
CREATE POLICY "Public read access for notice attachments" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'notices');

DROP POLICY IF EXISTS "Admins can upload/update/delete notice attachments" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete notice attachments" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'notices' AND is_platform_admin())
WITH CHECK (bucket_id = 'notices' AND is_platform_admin());

-- Policy for 'departments' bucket
DROP POLICY IF EXISTS "Public read access for department images" ON storage.objects;
CREATE POLICY "Public read access for department images" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'departments');

DROP POLICY IF EXISTS "Admins can upload/update/delete department images" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete department images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'departments' AND is_platform_admin())
WITH CHECK (bucket_id = 'departments' AND is_platform_admin());

-- Policy for 'hostels' bucket
DROP POLICY IF EXISTS "Public read access for hostel images" ON storage.objects;
CREATE POLICY "Public read access for hostel images" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'hostels');

DROP POLICY IF EXISTS "Admins can upload/update/delete hostel images" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete hostel images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'hostels' AND is_platform_admin())
WITH CHECK (bucket_id = 'hostels' AND is_platform_admin());

-- Policy for 'hospital' bucket
DROP POLICY IF EXISTS "Public read access for hospital images" ON storage.objects;
CREATE POLICY "Public read access for hospital images" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'hospital');

DROP POLICY IF EXISTS "Admins can upload/update/delete hospital images" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete hospital images" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'hospital' AND is_platform_admin())
WITH CHECK (bucket_id = 'hospital' AND is_platform_admin());

-- Policy for 'branding' bucket
DROP POLICY IF EXISTS "Public read access for branding assets" ON storage.objects;
CREATE POLICY "Public read access for branding assets" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'branding');

DROP POLICY IF EXISTS "Admins can upload/update/delete branding assets" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete branding assets" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'branding' AND is_platform_admin())
WITH CHECK (bucket_id = 'branding' AND is_platform_admin());

-- Policy for 'media' (general media) bucket
-- Requires specific public path for public reads, otherwise only admins
DROP POLICY IF EXISTS "Public read access for specific media path" ON storage.objects;
CREATE POLICY "Public read access for specific media path" ON storage.objects
FOR SELECT TO anon, authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'public'); -- Only 'public' subfolder is readable

DROP POLICY IF EXISTS "Admins can upload/update/delete media files" ON storage.objects;
CREATE POLICY "Admins can upload/update/delete media files" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'media' AND is_platform_admin())
WITH CHECK (bucket_id = 'media' AND is_platform_admin());

-- ================================================================================================
-- 12. Seed Data (Optional, but useful for initial setup)
--     Adding default roles and permissions.
-- ================================================================================================

INSERT INTO public.roles (id, name, description)
VALUES
    (gen_random_uuid(), 'admin', 'Platform administrator with full system access.'),
    (gen_random_uuid(), 'editor', 'Can create and manage content for assigned institutions.'),
    (gen_random_uuid(), 'viewer', 'Read-only access to backend content.'),
    (gen_random_uuid(), 'member', 'General authenticated user.')
ON CONFLICT (name) DO NOTHING;

-- Example permissions (expand as needed for granular control)
INSERT INTO public.permissions (id, name, description)
VALUES
    (gen_random_uuid(), 'institutions:manage', 'Manage institution settings and users.'),
    (gen_random_uuid(), 'pages:create', 'Create new pages.'),
    (gen_random_uuid(), 'pages:edit_own', 'Edit own created pages.'),
    (gen_random_uuid(), 'pages:edit_all', 'Edit all pages.'),
    (gen_random_uuid(), 'pages:publish', 'Publish/unpublish pages.'),
    (gen_random_uuid(), 'notices:manage', 'Create, edit, delete, publish notices.'),
    (gen_random_uuid(), 'gallery:manage', 'Upload, edit, delete gallery images.'),
    (gen_random_uuid(), 'faculty:manage', 'Manage faculty member information.'),
    (gen_random_uuid(), 'departments:manage', 'Manage departments (colleges/hospitals).'),
    (gen_random_uuid(), 'hostels:manage', 'Manage hostel facilities.'),
    (gen_random_uuid(), 'hospital_departments:manage', 'Manage hospital department information.'),
    (gen_random_uuid(), 'inquiries:view', 'View admission and contact inquiries.'),
    (gen_random_uuid(), 'inquiries:manage', 'Update status and notes for inquiries.'),
    (gen_random_uuid(), 'media:upload', 'Upload new media files.'),
    (gen_random_uuid(), 'media:manage', 'Edit and delete all media files.'),
    (gen_random_uuid(), 'seo:manage', 'Manage SEO metadata.'),
    (gen_random_uuid(), 'settings:manage', 'Manage site-wide settings.'),
    (gen_random_uuid(), 'themes:manage', 'Manage themes and theme assignments.'),
    (gen_random_uuid(), 'users:manage_roles', 'Assign and revoke user roles.'),
    (gen_random_uuid(), 'audit_logs:view', 'View audit logs.')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles (example: 'admin' has all permissions for now)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Example for 'editor' role (more limited)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'editor' AND p.name IN (
    'pages:create', 'pages:edit_all', 'pages:publish',
    'notices:manage', 'gallery:manage', 'faculty:manage',
    'departments:manage', 'hostels:manage', 'hospital_departments:manage',
    'inquiries:view', 'media:upload', 'media:manage', 'seo:manage'
)
ON CONFLICT DO NOTHING;

-- Secure `auth.users` table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view their own profile" ON auth.users
FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow authenticated users with admin role to view other profiles (for admin panel)
CREATE POLICY "Admins can view all user profiles" ON auth.users
FOR SELECT TO authenticated USING (is_platform_admin());

-- No insert/update/delete for auth.users directly, as it's managed by Supabase Auth.
-- Any profile-related data should be in a separate `profiles` table.

-- Create a profiles table for additional user metadata, linked to auth.users
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile." ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles." ON public.profiles
FOR SELECT TO authenticated USING (is_platform_admin());

CREATE POLICY "Admins can update all profiles." ON public.profiles
FOR UPDATE TO authenticated USING (is_platform_admin());

-- Function to create a user profile when a new user signs up via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user() function on auth.users inserts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up the `auth.jwt()` type for functions (Supabase default)
-- It's common for RLS and functions to use `auth.uid()`, `auth.role()`, etc.
-- This is usually configured by Supabase automatically, but it's good to be aware.

-- Set default row-level security for `public` schema tables (most are already covered above)
-- This ensures that if a new table is created, it's secure by default, though specific
-- policies should always be added.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC;

-- End of setup.sql
-- ================================================================================================