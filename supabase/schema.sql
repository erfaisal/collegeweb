-- ==============================================================================
-- INITIAL SETUP & UTILITIES
-- ==============================================================================

-- Enable the uuid-ossp extension if not already enabled (gen_random_uuid() is built-in in PG 13+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==============================================================================
-- CORE SETTINGS & THEMES
-- ==============================================================================

-- Table: site_settings
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL,
    site_description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    social_facebook TEXT,
    social_twitter TEXT,
    social_linkedin TEXT,
    social_instagram TEXT,
    primary_color TEXT DEFAULT '#0f172a',
    secondary_color TEXT DEFAULT '#334155',
    accent_color TEXT DEFAULT '#3b82f6',
    show_hospital BOOLEAN DEFAULT false,
    show_hostel BOOLEAN DEFAULT false,
    show_gallery BOOLEAN DEFAULT true,
    show_faculty BOOLEAN DEFAULT true,
    show_placements BOOLEAN DEFAULT true,
    show_research BOOLEAN DEFAULT true,
    show_testimonials BOOLEAN DEFAULT true,
    show_contact_form BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: themes
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    background_color TEXT DEFAULT '#ffffff',
    text_color TEXT DEFAULT '#111827',
    font_family_base TEXT DEFAULT 'Inter, sans-serif',
    font_family_heading TEXT DEFAULT 'Inter, sans-serif',
    border_radius TEXT DEFAULT '0.375rem',
    layout_style TEXT DEFAULT 'boxed',
    dark_mode_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_themes_is_active ON themes(is_active) WHERE is_active = true;

CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ==============================================================================
-- STRUCTURE & NAVIGATION
-- ==============================================================================

-- Table: modules
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_key TEXT NOT NULL UNIQUE,
    module_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    enabled BOOLEAN DEFAULT true,
    visible_in_navbar BOOLEAN DEFAULT true,
    visible_in_homepage BOOLEAN DEFAULT false,
    visible_in_footer BOOLEAN DEFAULT true,
    homepage_order INTEGER DEFAULT 0,
    route_path TEXT NOT NULL,
    category TEXT,
    supports_gallery BOOLEAN DEFAULT false,
    supports_seo BOOLEAN DEFAULT false,
    supports_custom_page BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_enabled ON modules(enabled);
CREATE INDEX idx_modules_homepage_order ON modules(homepage_order);

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: navigation
CREATE TABLE navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES navigation(id) ON DELETE CASCADE,
    position TEXT,
    order_index INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    open_in_new_tab BOOLEAN DEFAULT false,
    show_in_navbar BOOLEAN DEFAULT true,
    show_in_footer BOOLEAN DEFAULT false,
    is_external BOOLEAN DEFAULT false,
    module_key TEXT REFERENCES modules(module_key) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_navigation_parent_id ON navigation(parent_id);
CREATE INDEX idx_navigation_order_index ON navigation(order_index);
CREATE INDEX idx_navigation_visible ON navigation(visible);

CREATE TRIGGER update_navigation_updated_at
    BEFORE UPDATE ON navigation
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    category_type TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_type ON categories(category_type);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_order ON categories(display_order);

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ==============================================================================
-- PAGES & CONTENT MANAGEMENT
-- ==============================================================================

-- Table: pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    content TEXT,
    featured_image_url TEXT,
    page_type TEXT NOT NULL DEFAULT 'standard',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    is_published BOOLEAN DEFAULT false,
    show_in_navbar BOOLEAN DEFAULT false,
    show_in_footer BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT false,
    template TEXT,
    author_name TEXT,
    route_path TEXT,
    display_order INTEGER DEFAULT 0,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_is_published ON pages(is_published);
CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_pages_display_order ON pages(display_order);

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: homepage_sections
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    button_text TEXT,
    button_link TEXT,
    layout_type TEXT NOT NULL DEFAULT 'grid',
    background_style TEXT,
    visible BOOLEAN DEFAULT true,
    enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    module_key TEXT REFERENCES modules(module_key) ON DELETE SET NULL,
    custom_css_class TEXT,
    animation_style TEXT,
    section_data JSONB,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_homepage_sections_key ON homepage_sections(section_key);
CREATE INDEX idx_homepage_sections_enabled ON homepage_sections(enabled);
CREATE INDEX idx_homepage_sections_order ON homepage_sections(display_order);

CREATE TRIGGER update_homepage_sections_updated_at
    BEFORE UPDATE ON homepage_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ==============================================================================
-- ASSETS & SEO
-- ==============================================================================

-- Table: media
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_extension TEXT NOT NULL,
    media_type TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    seo_title TEXT,
    seo_description TEXT,
    category TEXT,
    folder TEXT,
    tags TEXT[],
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    bucket_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_created_at ON media(created_at);

CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: seo
CREATE TABLE seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    keywords TEXT[],
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image_url TEXT,
    robots TEXT DEFAULT 'index, follow',
    revisit_after TEXT,
    structured_data JSONB,
    author TEXT,
    language TEXT DEFAULT 'en',
    favicon_url TEXT,
    theme_color TEXT,
    page_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_page_path ON seo(page_path);

CREATE TRIGGER update_seo_updated_at
    BEFORE UPDATE ON seo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ==============================================================================
-- ACCESS CONTROL & AUDIT LOGS
-- ==============================================================================

-- Table: user_roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB,
    can_manage_users BOOLEAN DEFAULT false,
    can_manage_settings BOOLEAN DEFAULT false,
    can_manage_navigation BOOLEAN DEFAULT false,
    can_manage_pages BOOLEAN DEFAULT false,
    can_manage_gallery BOOLEAN DEFAULT false,
    can_manage_notices BOOLEAN DEFAULT false,
    can_manage_faculty BOOLEAN DEFAULT false,
    can_manage_admissions BOOLEAN DEFAULT false,
    can_manage_departments BOOLEAN DEFAULT false,
    can_manage_hostels BOOLEAN DEFAULT false,
    can_manage_hospital BOOLEAN DEFAULT false,
    can_manage_media BOOLEAN DEFAULT false,
    can_manage_seo BOOLEAN DEFAULT false,
    can_publish_content BOOLEAN DEFAULT false,
    is_super_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_name ON user_roles(role_name);

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    description TEXT,
    previous_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    route_path TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);


-- ==============================================================================
-- INSTITUTIONAL CMS ENTITIES
-- ==============================================================================

-- Table: gallery
CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT,
    featured BOOLEAN DEFAULT false,
    visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_visible ON gallery(visible);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_gallery_order ON gallery(display_order);

CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: notices
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    pdf_url TEXT,
    publish_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notices_publish_date ON notices(publish_date);

CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: faculty
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    qualification TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_faculty_order ON faculty(display_order);

CREATE TRIGGER update_faculty_updated_at
    BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: admissions
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_course ON admissions(course);
CREATE INDEX idx_admissions_created_at ON admissions(created_at);

-- Table: departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    hod_name TEXT,
    featured_image_url TEXT,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_slug ON departments(slug);
CREATE INDEX idx_departments_visible ON departments(visible);

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: hostels
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_name TEXT NOT NULL,
    hostel_type TEXT NOT NULL,
    description TEXT,
    capacity INTEGER,
    warden_name TEXT,
    featured_image_url TEXT,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hostels_type ON hostels(hostel_type);
CREATE INDEX idx_hostels_visible ON hostels(visible);

CREATE TRIGGER update_hostels_updated_at
    BEFORE UPDATE ON hostels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: hospital_departments
CREATE TABLE hospital_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name TEXT NOT NULL,
    description TEXT,
    hod_name TEXT,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospital_departments_visible ON hospital_departments(visible);

CREATE TRIGGER update_hospital_departments_updated_at
    BEFORE UPDATE ON hospital_departments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    designation TEXT,
    message TEXT NOT NULL,
    image_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_testimonials_visible ON testimonials(visible);

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table: events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    featured_image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_visible ON events(visible);
CREATE INDEX idx_events_start_date ON events(start_date);

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
