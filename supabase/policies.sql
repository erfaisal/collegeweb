-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- ==============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- PUBLIC POLICIES (READ-ONLY FOR VISIBLE/PUBLISHED CONTENT)
-- NEVER allow insert, update, or delete for public users.
-- ==============================================================================

-- Themes (Public can only read active themes)
CREATE POLICY "Enable read access for public to active themes" 
    ON themes FOR SELECT 
    TO public 
    USING (is_active = true);

-- Navigation (Public can read visible navigation links)
CREATE POLICY "Enable read access for public to visible navigation" 
    ON navigation FOR SELECT 
    TO public 
    USING (visible = true);

-- Modules (Public can read enabled modules)
CREATE POLICY "Enable read access for public to enabled modules" 
    ON modules FOR SELECT 
    TO public 
    USING (enabled = true);

-- Pages (Public can read published pages)
CREATE POLICY "Enable read access for public to published pages" 
    ON pages FOR SELECT 
    TO public 
    USING (is_published = true);

-- Homepage Sections (Public can read enabled and visible sections)
CREATE POLICY "Enable read access for public to visible homepage sections" 
    ON homepage_sections FOR SELECT 
    TO public 
    USING (enabled = true AND visible = true);

-- Categories (Public can read visible categories)
CREATE POLICY "Enable read access for public to visible categories" 
    ON categories FOR SELECT 
    TO public 
    USING (visible = true);

-- Media (Public can read public media files)
CREATE POLICY "Enable read access for public to public media" 
    ON media FOR SELECT 
    TO public 
    USING (is_public = true);

-- Gallery (Public can read visible gallery items)
CREATE POLICY "Enable read access for public to visible gallery items" 
    ON gallery FOR SELECT 
    TO public 
    USING (visible = true);

-- Notices (Public can read all published notices)
CREATE POLICY "Enable read access for public to notices" 
    ON notices FOR SELECT 
    TO public 
    USING (true);

-- Faculty (Public can read all faculty profiles)
CREATE POLICY "Enable read access for public to faculty" 
    ON faculty FOR SELECT 
    TO public 
    USING (true);

-- Departments (Public can read visible departments)
CREATE POLICY "Enable read access for public to visible departments" 
    ON departments FOR SELECT 
    TO public 
    USING (visible = true);

-- Hostels (Public can read visible hostels)
CREATE POLICY "Enable read access for public to visible hostels" 
    ON hostels FOR SELECT 
    TO public 
    USING (visible = true);

-- Hospital Departments (Public can read visible hospital departments)
CREATE POLICY "Enable read access for public to visible hospital departments" 
    ON hospital_departments FOR SELECT 
    TO public 
    USING (visible = true);

-- Testimonials (Public can read visible testimonials)
CREATE POLICY "Enable read access for public to visible testimonials" 
    ON testimonials FOR SELECT 
    TO public 
    USING (visible = true);

-- Events (Public can read visible events)
CREATE POLICY "Enable read access for public to visible events" 
    ON events FOR SELECT 
    TO public 
    USING (visible = true);


-- ==============================================================================
-- ADMIN-STYLE SECURE TABLES (AUTHENTICATED USERS ONLY)
-- Strict restriction: Public cannot read or modify these tables.
-- Front-end CMS rendering for these tables must be done via Server/Service Role.
-- ==============================================================================

-- Site Settings
CREATE POLICY "Allow full access to site_settings for authenticated users" 
    ON site_settings FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- SEO Data
CREATE POLICY "Allow full access to seo for authenticated users" 
    ON seo FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- User Roles (Foundation for future RBAC expansion)
CREATE POLICY "Allow full access to user_roles for authenticated users" 
    ON user_roles FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Audit Logs (Strictly internal tracking)
CREATE POLICY "Allow full access to audit_logs for authenticated users" 
    ON audit_logs FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Admissions (Public cannot insert directly via Supabase public anon key to prevent spam)
-- Form submissions should be routed through a secure Next.js API route using a Service Key.
CREATE POLICY "Allow full access to admissions for authenticated users" 
    ON admissions FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);


-- ==============================================================================
-- AUTHENTICATED STAFF POLICIES (FULL CMS CONTENT MANAGEMENT)
-- Allows authenticated users to create, update, and delete content.
-- Structured to support future multi-admin systems and RBAC filtering.
-- ==============================================================================

CREATE POLICY "Allow full access to themes for authenticated users" 
    ON themes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to navigation for authenticated users" 
    ON navigation FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to modules for authenticated users" 
    ON modules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to pages for authenticated users" 
    ON pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to homepage_sections for authenticated users" 
    ON homepage_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to categories for authenticated users" 
    ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to media for authenticated users" 
    ON media FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to gallery for authenticated users" 
    ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to notices for authenticated users" 
    ON notices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to faculty for authenticated users" 
    ON faculty FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to departments for authenticated users" 
    ON departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to hostels for authenticated users" 
    ON hostels FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to hospital_departments for authenticated users" 
    ON hospital_departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to testimonials for authenticated users" 
    ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to events for authenticated users" 
    ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
