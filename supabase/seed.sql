-- ==============================================================================
-- 1. SITE SETTINGS
-- ==============================================================================
-- Inserts default institutional settings. Using a fixed UUID to prevent duplicates.

INSERT INTO site_settings (
    id, 
    site_name, 
    site_description, 
    contact_email, 
    contact_phone, 
    address, 
    primary_color, 
    secondary_color, 
    accent_color,
    show_hospital,
    show_hostel,
    show_gallery,
    show_faculty,
    show_placements,
    show_research,
    show_testimonials,
    show_contact_form
) 
VALUES (
    '10000000-0000-0000-0000-000000000001', 
    'Lumina Medical Institute', 
    'Empowering the next generation of healthcare professionals with world-class education and clinical excellence.', 
    'admissions@luminamedical.edu', 
    '+1 (800) 555-MED1', 
    '100 Health Science Blvd, MedCity, ST 12345', 
    '#059669', -- Emerald Green
    '#047857', -- Darker Green
    '#34d399', -- Light Green
    true, 
    true, 
    true, 
    true, 
    true, 
    true, 
    true, 
    true
)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 2. THEMES
-- ==============================================================================
-- Inserts a default green/white medical theme.

INSERT INTO themes (
    id, 
    theme_name, 
    is_active, 
    primary_color, 
    secondary_color, 
    accent_color, 
    background_color, 
    text_color, 
    layout_style
) 
VALUES (
    '20000000-0000-0000-0000-000000000001', 
    'Medical Green Default', 
    true, 
    '#059669', 
    '#047857', 
    '#34d399', 
    '#ffffff', 
    '#1e293b', 
    'boxed'
)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 3. MODULES
-- ==============================================================================
-- Seeds the system with standard active modules.

INSERT INTO modules (module_key, module_name, description, enabled, route_path, category) 
VALUES 
    ('gallery', 'Gallery', 'Campus and event photo gallery', true, '/gallery', 'Media'),
    ('faculty', 'Faculty', 'Directory of teaching staff and doctors', true, '/faculty', 'Academic'),
    ('admissions', 'Admissions', 'Student admission portals and applications', true, '/admissions', 'Administrative'),
    ('notices', 'Notices', 'Important announcements and circulars', true, '/notices', 'Communication'),
    ('hospital', 'Hospital', 'Associated teaching hospital services', true, '/hospital', 'Medical'),
    ('hostel', 'Hostel', 'Student accommodation details', true, '/hostels', 'Campus Life'),
    ('events', 'Events', 'Upcoming campus events and seminars', true, '/events', 'Campus Life'),
    ('testimonials', 'Testimonials', 'Student and alumni success stories', true, '/testimonials', 'Marketing')
ON CONFLICT (module_key) DO NOTHING;


-- ==============================================================================
-- 4. NAVIGATION
-- ==============================================================================
-- Seeds default navbar and footer links.

INSERT INTO navigation (id, label, href, order_index, show_in_navbar, show_in_footer, module_key) 
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'Home', '/', 1, true, true, null),
    ('30000000-0000-0000-0000-000000000002', 'About Us', '/about', 2, true, true, null),
    ('30000000-0000-0000-0000-000000000003', 'Admissions', '/admissions', 3, true, true, 'admissions'),
    ('30000000-0000-0000-0000-000000000004', 'Gallery', '/gallery', 4, true, true, 'gallery'),
    ('30000000-0000-0000-0000-000000000005', 'Faculty', '/faculty', 5, true, true, 'faculty'),
    ('30000000-0000-0000-0000-000000000006', 'Notices', '/notices', 6, true, true, 'notices'),
    ('30000000-0000-0000-0000-000000000007', 'Contact', '/contact', 7, true, true, null)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 5. HOMEPAGE SECTIONS
-- ==============================================================================
-- Seeds the default structural layout for the CMS homepage renderer.

INSERT INTO homepage_sections (id, section_key, title, subtitle, layout_type, visible, enabled, display_order) 
VALUES 
    ('40000000-0000-0000-0000-000000000001', 'hero', 'Empowering Future Healers', 'Join a tradition of excellence in medical education and clinical care.', 'banner', true, true, 1),
    ('40000000-0000-0000-0000-000000000002', 'about', 'About the Institute', 'Committed to innovation, research, and saving lives since 1995.', 'split', true, true, 2),
    ('40000000-0000-0000-0000-000000000003', 'admissions', 'Admissions Open', 'Begin your journey. Apply for our MBBS, MD, and Allied Health programs.', 'grid', true, true, 3),
    ('40000000-0000-0000-0000-000000000004', 'gallery', 'Campus Life', 'Explore our state-of-the-art laboratories and teaching hospital.', 'masonry', true, true, 4),
    ('40000000-0000-0000-0000-000000000005', 'faculty', 'World-Class Faculty', 'Learn from renowned doctors and medical researchers.', 'cards', true, true, 5),
    ('40000000-0000-0000-0000-000000000006', 'testimonials', 'Student Voices', 'Hear what our alumni have to say about their experience.', 'slider', true, true, 6)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 6. CATEGORIES
-- ==============================================================================
-- Seeds standard taxonomy categories used across various modules.

INSERT INTO categories (name, slug, category_type, description, visible) 
VALUES 
    ('Campus Infrastructure', 'campus-infrastructure', 'gallery', 'Photos of our medical campus and buildings', true),
    ('Clinical Facilities', 'clinical-facilities', 'gallery', 'Teaching hospital and clinical labs', true),
    ('General Medicine', 'general-medicine', 'faculty', 'Department of General Medicine', true),
    ('Surgery', 'surgery', 'faculty', 'Department of Surgery and Operation Theaters', true),
    ('Exam Notices', 'exam-notices', 'notices', 'University examination schedules and results', true),
    ('General Circulars', 'general-circulars', 'notices', 'Administrative announcements and holidays', true),
    ('Boys Hostel', 'boys-hostel', 'hostels', 'Male student accommodation details', true),
    ('Girls Hostel', 'girls-hostel', 'hostels', 'Female student accommodation details', true)
ON CONFLICT (slug) DO NOTHING;


-- ==============================================================================
-- 7. PAGES
-- ==============================================================================
-- Seeds placeholder informational pages.

INSERT INTO pages (title, slug, page_type, is_published, content, short_description, show_in_footer) 
VALUES 
    ('About Us', 'about', 'standard', true, '<h2>Our History</h2><p>Lumina Medical Institute was established to provide world-class medical education and affordable healthcare. Our mission is to produce competent medical graduates who can serve the community with empathy and excellence.</p>', 'Learn about our mission, vision, and legacy.', false),
    ('Contact Us', 'contact', 'standard', true, '<h2>Get in Touch</h2><p>Email: admissions@luminamedical.edu<br>Phone: +1 (800) 555-MED1</p><p>We are available Monday to Saturday, 9 AM to 5 PM.</p>', 'Contact our administrative and admissions office.', true),
    ('Privacy Policy', 'privacy-policy', 'policy', true, '<h2>Privacy Policy</h2><p>We respect your privacy and are committed to protecting the personal data of our students and patients.</p>', 'Our institutional data protection guidelines.', true),
    ('Anti Ragging', 'anti-ragging', 'policy', true, '<h2>Anti-Ragging Policy</h2><p>Lumina Medical Institute has a zero-tolerance policy towards ragging in any form, in strict adherence to National Medical Commission guidelines.</p>', 'Strict adherence to anti-ragging guidelines.', true),
    ('Hostel Facilities', 'hostel-facilities', 'hostel', true, '<h2>Campus Accommodation</h2><p>We provide secure, well-furnished separate hostels for boys and girls within the campus premises, featuring mess facilities, Wi-Fi, and 24/7 security.</p>', 'Details about student housing and campus life.', false)
ON CONFLICT (slug) DO NOTHING;


-- ==============================================================================
-- 8. SEO
-- ==============================================================================
-- Seeds default SEO records for the primary routes.

INSERT INTO seo (page_path, title, description, keywords, robots) 
VALUES 
    ('/', 'Home | Lumina Medical Institute', 'Welcome to Lumina Medical Institute, providing world-class medical education, state-of-the-art clinical facilities, and exceptional healthcare training.', ARRAY['medical college', 'MBBS admission', 'MD courses', 'healthcare education', 'teaching hospital']::TEXT[], 'index, follow'),
    ('/about', 'About Us | Lumina Medical Institute', 'Learn about the history, mission, and vision of Lumina Medical Institute and our commitment to medical excellence.', ARRAY['about medical college', 'history', 'mission', 'vision', 'accreditation']::TEXT[], 'index, follow'),
    ('/admissions', 'Admissions | Lumina Medical Institute', 'Apply now for undergraduate (MBBS) and postgraduate (MD/MS) medical programs for the upcoming academic session.', ARRAY['MBBS admission', 'MD admission', 'medical entrance', 'apply online', 'fee structure']::TEXT[], 'index, follow'),
    ('/contact', 'Contact Us | Lumina Medical Institute', 'Get in touch with the Lumina Medical Institute administration and admissions helpdesk.', ARRAY['contact medical college', 'helpdesk', 'phone number', 'email', 'campus address']::TEXT[], 'index, follow')
ON CONFLICT (page_path) DO NOTHING;
