Generate a production-grade Supabase buckets.sql file for a scalable institutional CMS platform.

Requirements:
- Use PostgreSQL syntax compatible with Supabase Storage
- Create these storage buckets:

1. gallery
2. faculty
3. notices
4. pages
5. logos
6. documents
7. hostels
8. hospital
9. events
10. media
11. testimonials
12. seo

Requirements:
- Buckets should be:
  public where appropriate
- Use:
  storage.create_bucket()

Create policies for each bucket:

PUBLIC ACCESS:
- Allow public read access for:
  images
  PDFs
  media files

AUTHENTICATED ACCESS:
- Allow authenticated users to:
  upload
  update
  delete

Requirements:
- Use:
  auth.uid()
- Use production-safe policy naming
- Add comments separating:
  bucket creation
  public policies
  authenticated upload policies

Requirements:
- Support future:
  centralized media systems
  CDN integration
  enterprise storage scaling
  role-based upload systems

Ensure:
- Public users cannot upload
- Public users cannot delete
- Authenticated admins can manage files

Return ONLY the complete buckets.sql content.
