# Setup & Deployment Guide: Institutional CMS Platform
Welcome to the official setup and deployment documentation for the Institutional CMS Platform. This guide provides step-by-step instructions to configure, secure, and deploy a production-ready Content Management System tailored for educational and medical institutions.
## 1. Project Overview
This Institutional CMS is a highly scalable, modular platform designed specifically to manage complex organizational websites (e.g., Medical Colleges, Engineering Universities, Schools).
**Key Characteristics:**
 * **Modular Architecture:** Features are divided into distinct, toggleable modules (Admissions, Hospital, Hostel, Faculty, Gallery, etc.).
 * **Admin-Controlled:** Comprehensive Role-Based Access Control (RBAC) allows fine-grained permissions for staff and administrators.
 * **Dynamic Rendering:** Content, navigation, homepage layouts, and themes are database-driven, allowing live updates without code deployments.
## 2. Tech Stack
The platform is built on a modern, edge-ready tech stack:
 * **Next.js 14:** The core React framework, utilizing the App Router for server-side rendering (SSR), static site generation (SSG), and API routes.
 * **Supabase:** The open-source Firebase alternative providing Authentication, Storage, and Realtime subscriptions.
 * **PostgreSQL:** The robust relational database powering Supabase, utilizing native Row Level Security (RLS).
 * **Tailwind CSS:** A utility-first CSS framework for rapid, responsive, and themeable UI development.
 * **Vercel:** The optimal deployment platform for Next.js, offering edge caching, CI/CD, and preview deployments.
## 3. Create Supabase Project
 1. Navigate to Supabase and sign in or create an account.
 2. Click **New Project** and select your organization.
 3. Provide a **Project Name** (e.g., lumina-cms-production) and generate a secure **Database Password**. Save this password securely.
 4. Select a **Region** closest to your target audience.
 5. Click **Create new project**. Wait a few minutes for the database to provision.
 6. Once provisioned, navigate to **Project Settings > API** to locate your Project URL and Anon Key.
## 4. Run SQL Files
To initialize the database, you must run the provided SQL scripts in a specific order to ensure foreign keys, policies, and seed data resolve correctly.
Navigate to the **SQL Editor** in your Supabase dashboard and execute the following files sequentially:
 1. **schema.sql**
   * *Purpose:* Creates tables, relationships, indexes, updated_at triggers, and default constraints.
 2. **policies.sql**
   * *Purpose:* Enables Row Level Security (RLS) on all tables, granting read-only access to the public and write access to authenticated users.
 3. **buckets.sql**
   * *Purpose:* Provisions the Supabase Storage buckets (e.g., gallery, notices, media) and applies strict upload/download access policies.
 4. **seed.sql**
   * *Purpose:* Inserts production-safe placeholder data, default themes, navigation links, and the homepage layout configuration so the UI renders immediately.
*Note: Ensure each script executes successfully before moving to the next. If an error occurs, resolve it before proceeding to prevent cascading failures.*
## 5. Environment Variables
Your Next.js application requires environment variables to communicate with Supabase.
### Local Setup
Create a .env.local file in the root of your repository:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (Keep this STRICTLY server-side, NEVER prefix with NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

```
### Security Considerations
 * **NEXT_PUBLIC_ Prefix:** Only variables safe for the browser should have this prefix. The Anon Key is safe to expose *provided* your Row Level Security (RLS) policies are correctly configured.
 * **Service Role Key:** This key bypasses all RLS. Only use it in secure server environments (like Next.js API routes or Server Actions) when administrative overrides are explicitly necessary.
## 6. Create Admin User
To manage the CMS, you need an initial Super Admin account.
 1. In the Supabase Dashboard, go to **Authentication > Users**.
 2. Click **Add User > Create new user**.
 3. Enter an admin email (e.g., admin@institution.edu) and a strong password.
 4. Once the user is created, copy their User UID.
 5. Go to the **Table Editor**, select the user_roles table, and click **Insert row**.
 6. Fill in the fields:
   * user_id: Paste the copied UID.
   * role_name: super_admin
   * display_name: System Administrator
   * is_super_admin: TRUE
   * is_active: TRUE
 7. Save the row. This user can now log into the CMS and bypass standard permission checks.
## 7. Deploy to Vercel
 1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
 2. Log in to Vercel and click **Add New > Project**.
 3. Import your repository.
 4. In the **Configure Project** section, open the **Environment Variables** tab.
 5. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 6. Click **Deploy**. Vercel will build the Next.js app and assign a production URL.
## 8. Production Security Checklist
Before going live, verify the following:
 * [ ] **RLS Enabled:** Confirm Row Level Security is active on *all* tables in the Supabase Table Editor (indicated by a padlock icon).
 * [ ] **Bucket Policies Verified:** Ensure public users have SELECT access only, and INSERT/UPDATE/DELETE require auth.uid() IS NOT NULL.
 * [ ] **HTTPS Enforced:** Vercel handles HTTPS automatically; ensure all custom domains are properly provisioned with SSL certificates.
 * [ ] **No Secrets Exposed:** Ensure the SUPABASE_SERVICE_ROLE_KEY is not exposed in the frontend client code.
 * [ ] **Authentication Settings:** Disable "Enable email confirmations" during initial testing if desired, but **enable** it for production security.
## 9. Media Upload Notes
The CMS utilizes Supabase Storage with dedicated buckets (gallery, faculty, media, notices, etc.) to organize files efficiently.
 * **Public vs. Private:** All CMS buckets are configured as **Public**. This means the *read* URL is accessible without authentication, which is required for website visitors to see images and PDFs.
 * **Upload Permissions:** Modifying bucket contents (upload, update, delete) is strictly restricted to authenticated staff via bucket policies. Public users cannot upload files.
## 10. Troubleshooting
**Issue: Data is not displaying / receiving 403 Permission Denied or PGRST116.**
 * **Cause:** Row Level Security (RLS) is blocking the query.
 * **Fix:** Verify policies.sql ran correctly. Ensure the data being queried meets the public policy requirements (e.g., visible = true, is_published = true).
**Issue: Image/PDF uploads are failing in the admin panel.**
 * **Cause:** Storage bucket policies are missing or the bucket does not exist.
 * **Fix:** Ensure buckets.sql was executed. Check that the user is logged in (authenticated) and their token hasn't expired.
**Issue: Vercel deployment crashes on build or shows a blank screen.**
 * **Cause:** Missing environment variables.
 * **Fix:** Check Vercel Project Settings > Environment Variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are exact matches to your Supabase project. Redeploy after adding them.
## 11. Future Scaling Notes
This CMS is architected with long-term scaling in mind:
 * **SaaS & Multi-Tenant Potential:** The schema utilizes UUIDs and abstract settings tables. To transition to a multi-tenant SaaS, you can add a tenant_id to all core tables and update the RLS policies to segment data per institution.
 * **Advanced RBAC:** The user_roles table includes granular boolean flags (e.g., can_manage_admissions, can_manage_faculty). As the institution grows, you can map these to specific UI views and API routes for highly restricted staff accounts.
 * **Headless Capability:** Because Next.js connects directly to Supabase via the service layer, you can easily spin up a mobile app (React Native/Flutter) using the exact same Supabase database and authentication flow.
