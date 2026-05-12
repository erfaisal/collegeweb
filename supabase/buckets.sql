-- ==============================================================================
-- STORAGE BUCKET CREATION
-- ==============================================================================
-- Creates the foundational public buckets for the institutional CMS.
-- Uses ON CONFLICT to ensure idempotency and safe production deployment.

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('gallery', 'gallery', true),
    ('faculty', 'faculty', true),
    ('notices', 'notices', true),
    ('pages', 'pages', true),
    ('logos', 'logos', true),
    ('documents', 'documents', true),
    ('hostels', 'hostels', true),
    ('hospital', 'hospital', true),
    ('events', 'events', true),
    ('media', 'media', true),
    ('testimonials', 'testimonials', true),
    ('seo', 'seo', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;


-- ==============================================================================
-- PUBLIC POLICIES (READ-ONLY)
-- ==============================================================================
-- Allows public users to read and download images, PDFs, and media files.
-- Public users are STRICTLY RESTRICTED from uploading, updating, or deleting.

-- 1. Gallery
CREATE POLICY "Public read access for gallery" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'gallery');

-- 2. Faculty
CREATE POLICY "Public read access for faculty" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'faculty');

-- 3. Notices
CREATE POLICY "Public read access for notices" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'notices');

-- 4. Pages
CREATE POLICY "Public read access for pages" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'pages');

-- 5. Logos
CREATE POLICY "Public read access for logos" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'logos');

-- 6. Documents
CREATE POLICY "Public read access for documents" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'documents');

-- 7. Hostels
CREATE POLICY "Public read access for hostels" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'hostels');

-- 8. Hospital
CREATE POLICY "Public read access for hospital" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'hospital');

-- 9. Events
CREATE POLICY "Public read access for events" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'events');

-- 10. Media (Centralized system fallback)
CREATE POLICY "Public read access for media" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'media');

-- 11. Testimonials
CREATE POLICY "Public read access for testimonials" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'testimonials');

-- 12. SEO
CREATE POLICY "Public read access for seo" 
    ON storage.objects FOR SELECT TO public 
    USING (bucket_id = 'seo');


-- ==============================================================================
-- AUTHENTICATED UPLOAD & MANAGEMENT POLICIES
-- ==============================================================================
-- Allows authenticated CMS admins and staff to upload, update, and delete files.
-- Uses auth.uid() checks to enforce authentication requirements at the storage layer.
-- Future RBAC can be expanded here by joining user_roles or JWT claims.

-- 1. Gallery
CREATE POLICY "Authenticated users can upload to gallery" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update gallery" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from gallery" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

-- 2. Faculty
CREATE POLICY "Authenticated users can upload to faculty" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'faculty' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update faculty" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'faculty' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from faculty" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'faculty' AND auth.uid() IS NOT NULL);

-- 3. Notices
CREATE POLICY "Authenticated users can upload to notices" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'notices' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update notices" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'notices' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from notices" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'notices' AND auth.uid() IS NOT NULL);

-- 4. Pages
CREATE POLICY "Authenticated users can upload to pages" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'pages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pages" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'pages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from pages" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'pages' AND auth.uid() IS NOT NULL);

-- 5. Logos
CREATE POLICY "Authenticated users can upload to logos" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update logos" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from logos" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

-- 6. Documents
CREATE POLICY "Authenticated users can upload to documents" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update documents" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from documents" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- 7. Hostels
CREATE POLICY "Authenticated users can upload to hostels" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'hostels' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hostels" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'hostels' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from hostels" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'hostels' AND auth.uid() IS NOT NULL);

-- 8. Hospital
CREATE POLICY "Authenticated users can upload to hospital" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'hospital' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hospital" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'hospital' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from hospital" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'hospital' AND auth.uid() IS NOT NULL);

-- 9. Events
CREATE POLICY "Authenticated users can upload to events" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'events' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update events" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from events" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);

-- 10. Media
CREATE POLICY "Authenticated users can upload to media" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from media" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- 11. Testimonials
CREATE POLICY "Authenticated users can upload to testimonials" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'testimonials' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update testimonials" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'testimonials' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from testimonials" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'testimonials' AND auth.uid() IS NOT NULL);

-- 12. SEO
CREATE POLICY "Authenticated users can upload to seo" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'seo' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update seo" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'seo' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete from seo" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'seo' AND auth.uid() IS NOT NULL);
