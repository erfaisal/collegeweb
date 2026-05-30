# SUPABASE_SETUP_INSTRUCTIONS.md

## 1. Introduction

This document provides step-by-step instructions for deploying the institutional CMS platform, built with Next.js 14, TypeScript, Supabase, and Vercel. Designed for scalability and white-labeling, this platform caters to engineering colleges, medical colleges, universities, schools, and hospitals, allowing for rapid deployment and customization.

These instructions are tailored for developers undertaking the initial setup and deployment of a new instance of the platform. By following these steps, you will configure your Supabase backend, connect it to your Next.js frontend, and deploy the application to Vercel, ensuring a production-grade setup.

## 2. Prerequisites

Before you begin, ensure you have the following installed and accounts set up:

*   **Git**: Version control system.
*   **Node.js**: LTS version (e.g., 18.x or 20.x).
*   **npm / yarn / pnpm**: Package manager for Node.js.
*   **Code Editor**: VS Code recommended.
*   **Supabase Account**: A free or paid account at [Supabase](https://supabase.com/).
*   **Vercel Account**: A free or paid account at [Vercel](https://vercel.com/).
*   **GitHub/GitLab/Bitbucket Account**: Your project repository should be hosted on one of these.

## 3. Create Supabase Project

1.  **Log in to Supabase**: Go to [app.supabase.com](https://app.supabase.com/) and log in.
2.  **Create New Project**: Click the "New project" button.
3.  **Organization**: Select an existing organization or create a new one.
4.  **Project Name**: Enter a descriptive name for your project (e.g., `my-institution-cms-prod`).
5.  **Database Password**: Set a strong, unique password for your database. **Store this securely.**
6.  **Region**: Choose a region geographically close to your target users for optimal performance.
7.  **Pricing Plan**: Select the "Free" plan to start, or a paid plan for production workloads.
8.  **Create Project**: Click "Create new project". Supabase will provision your database, which may take a few minutes.

## 4. Obtain Supabase Credentials

Once your Supabase project is created:

1.  **Navigate to Project Settings**: In your Supabase project dashboard, click on "Project Settings" (gear icon) in the left sidebar, then select "API".
2.  **Copy URL and Anon Key**:
    *   **Project URL**: Copy the value next to `URL`. This is your `NEXT_PUBLIC_SUPABASE_URL`.
    *   **Anon (public) Key**: Copy the `anon` `public` key. This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3.  **Copy Service Role Key**: Scroll down to the "Project API keys" section and copy the `service_role` `secret` key. **This key provides full bypass access to your RLS policies and must be kept strictly confidential.** This is your `SUPABASE_SERVICE_ROLE_KEY`.

## 5. Configure Authentication

Our platform uses Email/Password authentication as its primary method.

1.  **Enable Email Authentication**:
    *   In your Supabase project dashboard, navigate to "Authentication" in the left sidebar.
    *   Go to "Settings".
    *   Under "Authentication Providers", ensure "Email" is enabled.
    *   Review other settings like "Email Confirmations" and "Secure email change" and adjust as per your security requirements. We recommend enabling email confirmations for production.
2.  **Creating the First Admin Account**:
    *   Initially, there won't be any users. The first admin user will typically sign up through the application's `/auth/signup` page.
    *   Upon successful sign-up, a user entry is created in Supabase's `auth.users` table, and a corresponding profile entry is created in `public.profiles`.
    *   **Role Assignment Workflow**: To grant `admin` privileges to this user, you will need to manually update their role in the `public.profiles` table. This is crucial for accessing the admin dashboard.
    *   **Example SQL for Admin Role Assignment**:
        ```sql
        -- Assuming a user with the email 'admin@example.com' has already signed up.
        -- Find the user's UUID from auth.users (optional, but good for verification)
        SELECT id FROM auth.users WHERE email = 'admin@example.com';

        -- Update the role in the public.profiles table
        -- Replace 'YOUR_USER_UUID' with the actual UUID of the admin user
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = 'YOUR_USER_UUID';

        -- Verify the update
        SELECT id, email, role FROM public.profiles WHERE id = 'YOUR_USER_UUID';
        ```
    *   Ensure your `public.profiles` table has a `role` column (e.g., `VARCHAR` or `TEXT`) with a default value (e.g., `'user'`). The `setup.sql` script should handle this.

## 6. Execute setup.sql

The `setup.sql` file in your project repository contains the full database schema, including tables, Row Level Security (RLS) policies, functions, and initial seed data.

1.  **Access SQL Editor**: In your Supabase project dashboard, click on "SQL Editor" in the left sidebar.
2.  **Open setup.sql**: Locate the `setup.sql` file in your local repository.
3.  **Copy and Paste**: Copy the entire content of `setup.sql`.
4.  **Run SQL**: Paste the content into the Supabase SQL editor and click the "Run" button.
    *   **Note**: If the `setup.sql` file is very large, Supabase's SQL editor might struggle with a single execution. In such cases, you might need to split the file into logical sections (e.g., schema, RLS, functions, seed data) and run them individually.

## 7. Verify Database Tables

After executing `setup.sql`, verify that all necessary tables have been created and RLS is enabled.

1.  **Navigate to Table Editor**: In your Supabase project dashboard, click on "Table Editor" in the left sidebar.
2.  **Verify Tables**: Confirm the existence of the following core tables (and any others specific to your project):
    *   `public.profiles` (for user profiles and roles)
    *   `public.institutions` (main institution settings)
    *   `public.pages` (dynamic content pages)
    *   `public.notices` (news and announcements)
    *   `public.faculty` (faculty members)
    *   `public.departments` (academic departments)
    *   `public.admissions` (admission applications)
    *   `public.contacts` (contact form submissions)
    *   `public.settings` (global site settings)
    *   ... (and other module-specific tables like `public.hostels`, `public.hospital`, etc.)
3.  **Verify RLS**: For each critical table, check the "Row Level Security" column. It should indicate "Enabled" for most `public` tables to ensure data protection.

## 8. Verify Storage Buckets

The platform utilizes Supabase Storage buckets to manage various types of media assets efficiently.

1.  **Access Storage**: In your Supabase project dashboard, click on "Storage" in the left sidebar.
2.  **Verify Buckets**: Confirm the following buckets have been created (the `setup.sql` script typically includes commands to create these, or they are created on first upload if policies allow).
    *   **`gallery`**: Stores images for institutional photo galleries, campus photos, event highlights, and general visual assets for public display.
    *   **`faculty`**: Contains profile pictures, CVs, research papers, and other documents related to faculty members.
    *   **`notices`**: Holds attachments for official notices, circulars, event posters, and announcements.
    *   **`departments`**: Stores images, brochures, curriculum PDFs, and other specific assets for various academic or administrative departments.
    *   **`hostels`**: Manages images of hostel facilities, hostel application forms, and related documents. (Applicable for institutions with hostel facilities).
    *   **`hospital`**: For medical colleges/hospitals, this bucket stores images of hospital facilities, patient forms, departmental information, etc. (Applicable for medical institutions).
    *   **`branding`**: Crucial for white-labeling, this bucket stores institution-specific logos, favicons, brand guidelines, and other branding assets that differentiate each platform instance.
    *   **`media`**: A general-purpose bucket for miscellaneous media uploads not fitting into other specific categories, such as blog post images, static page images, etc.
3.  **Expected Usage**: Each bucket is designed for specific content types to ensure organizational clarity and enable fine-grained access control through storage policies.

## 9. Configure Storage Policies

While `setup.sql` should configure these, it's vital to verify them. Storage policies dictate who can upload, download, and delete files from your buckets.

1.  **Navigate to Storage Policies**: In the Supabase Storage section, click on "Policies" at the top.
2.  **Review Policies**: For each bucket, inspect its policies. Ensure:
    *   `anon` role has `SELECT` access to public assets (e.g., `gallery`, `branding`, most `media`).
    *   `authenticated` users (e.g., admin, faculty members) have `INSERT`/`UPDATE`/`DELETE` access for their specific content (e.g., `faculty` for faculty members, `notices` for admins).
    *   `service_role` has full access for server-side operations (e.g., initial seeding, maintenance).
    *   Policies prevent unauthorized users from uploading, modifying, or deleting sensitive content.
    *   **Example Policy (read access for public bucket)**:
        ```sql
        -- For a 'gallery' bucket
        CREATE POLICY "Allow public read access to gallery"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'gallery');
        ```
    *   **Example Policy (authenticated user upload to 'media')**:
        ```sql
        CREATE POLICY "Allow authenticated user uploads to media"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'media' AND auth.uid() = owner); -- Assuming 'owner' column or similar
        ```
    *   Adjust policies to match your specific application logic and security needs.

## 10. Create Initial Admin User

As explained in Section 5, you need to ensure at least one user has the `admin` role to access the admin dashboard.

1.  **Sign Up**: Access your deployed Next.js application's `/auth/signup` page (or the development environment's signup page).
2.  **Register as User**: Create a new user account with an email and password.
3.  **Get User ID**: In your Supabase dashboard, go to "Authentication" -> "Users". Find the newly created user and copy their UUID (the long string of letters and numbers).
4.  **Assign Admin Role**: Go to "SQL Editor" and run the following query, replacing `'YOUR_USER_UUID'` with the actual UUID copied in the previous step, and `'admin@example.com'` with the email you used:
    ```sql
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
    -- Or if you have the UUID directly:
    -- UPDATE public.profiles
    -- SET role = 'admin'
    -- WHERE id = 'YOUR_USER_UUID';
    ```
5.  **Verify Role**:
    ```sql
    SELECT id, email, role FROM public.profiles WHERE id = 'YOUR_USER_UUID';
    ```
    This should show the user's role as `admin`.

## 11. Configure Environment Variables

Environment variables are essential for connecting your Next.js application to Supabase and configuring various application settings.

1.  **Create `.env.local`**: In the root of your project, create a file named `.env.local`.
2.  **Populate with Credentials**: Add the Supabase credentials obtained earlier, along with other necessary variables.
    *   `NEXT_PUBLIC_` variables are exposed to the browser.
    *   Variables without `NEXT_PUBLIC_` are server-side only.

    ```bash
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiI..."
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiI..." # KEEP THIS SECRET! Never expose client-side.

    # Application Configuration
    NEXT_PUBLIC_APP_NAME="My Institution CMS"
    NEXT_PUBLIC_APP_DESCRIPTION="A scalable white-label institutional CMS platform."
    NEXT_PUBLIC_APP_URL="https://www.your-platform.com" # Your production domain

    # Vercel Environment (automatically set by Vercel in production)
    # Use 'development' for local, 'preview' for Vercel preview deploys, 'production' for Vercel production
    NEXT_PUBLIC_VERCEL_ENV="development" # Set to 'production' on Vercel

    # Admin Settings
    NEXT_PUBLIC_ADMIN_EMAIL="admin@your-platform.com" # Default admin contact for some notifications

    # Email Service Configuration (e.g., Resend, SendGrid, Mailgun)
    # Only if your application uses a transactional email service directly from the backend
    # RESEND_API_KEY="re_..."
    # NO_REPLY_EMAIL="no-reply@your-platform.com"

    # Other Platform Specific Settings
    # NEXT_PUBLIC_CONTACT_EMAIL="contact@your-platform.com"
    # NEXT_PUBLIC_ADMISSIONS_EMAIL="admissions@your-platform.com"
    # NEXT_PUBLIC_TWITTER_HANDLE="@your_institution"
    # NEXT_PUBLIC_INSTAGRAM_HANDLE="your_institution"
    # NEXT_PUBLIC_FACEBOOK_HANDLE="your_institution"
    # NEXT_PUBLIC_LINKEDIN_URL="https://linkedin.com/company/your_institution"

    # Google Analytics / GTM (if integrated)
    # NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
    # NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"

    # Optionally, for local development with HTTPS (e.g., mkcert)
    # NODE_TLS_REJECT_UNAUTHORIZED=0
    ```
3.  **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` **must never** be exposed to the client-side. It should only be used in server-side code (API routes, server components/actions).

## 12. Configure Vercel Project

1.  **Push to Git Repository**: Ensure your project code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).
2.  **Log in to Vercel**: Go to [vercel.com](https://vercel.com/) and log in.
3.  **Add New Project**: From your Vercel dashboard, click "Add New..." -> "Project".
4.  **Import Git Repository**: Select your Git provider and import the repository containing your CMS project.
5.  **Configure Project**:
    *   **Root Directory**: If your Next.js app is not in the root, specify the correct root directory.
    *   **Framework Preset**: Vercel should auto-detect "Next.js".
    *   **Build & Output Settings**: Usually, the defaults are sufficient. If your project has custom build commands, configure them here.
    *   **Environment Variables**: You will add these in the next step.

## 13. Add Environment Variables to Vercel

This is a critical step for your deployed application to function correctly.

1.  **Navigate to Project Settings**: In Vercel, go to your imported project, then click on "Settings" -> "Environment Variables".
2.  **Add Variables**: Add each environment variable from your `.env.local` file (except for local-only ones like `NODE_TLS_REJECT_UNAUTHORIZED`).
    *   For each variable:
        *   **Name**: Copy the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`).
        *   **Value**: Copy its corresponding value.
        *   **Environments**: Select "Production", "Preview", and "Development". Ensure `SUPABASE_SERVICE_ROLE_KEY` is added to all environments where server-side logic might run (typically all of them, but its usage is restricted to server-side code).
3.  **Special `NEXT_PUBLIC_VERCEL_ENV`**: Vercel automatically sets `VERCEL_ENV` (which maps to `NEXT_PUBLIC_VERCEL_ENV` if you use it in `next.config.js`). You generally don't need to manually set `NEXT_PUBLIC_VERCEL_ENV` as a variable in Vercel unless you want to override its default behavior. For production, Vercel automatically sets it to `production`. For preview deployments, `preview`, and for local `development`.

## 14. Deploy to Vercel

1.  **Initiate Deployment**: After adding environment variables, you can either:
    *   Trigger a new deployment manually from the Vercel dashboard by going to the "Deployments" tab and clicking "Deploy".
    *   Push a new commit to your connected Git branch, which will automatically trigger a deployment.
2.  **Monitor Build Logs**: Vercel will start building your project. Monitor the build logs to ensure there are no errors. Any issues with environment variables, dependencies, or code will appear here.

## 15. Verify Production Deployment

Once the deployment is complete and shows "Ready" on Vercel:

1.  **Access Deployment URL**: Click on the generated deployment URL (e.g., `your-project-name.vercel.app`).
2.  **Basic Page Load**: Verify that the homepage and other public pages load without errors.
3.  **Console for Errors**: Open your browser's developer console (F12) and check for any client-side errors.

## 16. Configure Branding Assets

For white-label instances, branding is crucial.

1.  **Access Admin Dashboard**: Log in to the admin dashboard using the admin user created earlier.
2.  **Navigate to Branding Settings**: Locate the "Branding" or "Site Settings" section within the admin panel.
3.  **Upload Assets**:
    *   Upload the institution's main logo, favicon, and any other brand-specific images. These will typically be stored in the `branding` Supabase Storage bucket.
    *   Verify that these assets are correctly displayed on the frontend.

## 17. Configure Site Settings

General site information is managed here.

1.  **Access Admin Dashboard**: Log in as an admin.
2.  **Navigate to Site Settings**: Find the "Settings" or "General Settings" section.
3.  **Update Details**:
    *   Update the institution's name, description, contact information (phone, email, address).
    *   Configure social media links.
    *   Save changes and verify they reflect correctly on the frontend (e.g., footer, contact page).

## 18. Enable Modules

The platform is modular, allowing you to enable or disable features based on the institution's needs.

1.  **Access Admin Dashboard**: Log in as an admin.
2.  **Navigate to Module Management**: Find a section like "Modules," "Features," or "Configuration."
3.  **Toggle Modules**:
    *   Enable/disable modules such as "Admissions," "Hospital Services," "Hostel Facilities," "Blog," etc.
    *   Verify that enabled modules appear on the frontend (e.g., navigation links, dedicated pages) and disabled modules are hidden. This often involves updating flags in a `public.settings` table.

## 19. Test Admin Login

1.  **Access Admin Login Page**: Navigate to `your-app-url.com/admin` or `your-app-url.com/dashboard`.
2.  **Enter Credentials**: Use the email and password of the admin user created in Section 10.
3.  **Verify Access**: Confirm successful login and full access to the admin dashboard features. Check that non-admin users cannot access this area.

## 20. Test Media Uploads

1.  **Navigate to Media Library / Specific Module**: In the admin dashboard, go to a section that allows media uploads (e.g., "Gallery," "Notices," "Faculty," "Media Library").
2.  **Upload Files**: Upload a test image or document to different sections.
3.  **Verify Storage**:
    *   Check your Supabase Storage dashboard to ensure the files appear in the correct buckets (`gallery`, `notices`, `faculty`, `media`, etc.).
    *   Verify that the uploaded files are publicly accessible (if intended) and render correctly on the frontend (e.g., a gallery image, a faculty profile picture).

## 21. Test Dynamic Pages

1.  **Create a Page**: In the admin dashboard, navigate to "Pages" or "CMS Content." Create a new dynamic page with some test content.
2.  **Publish Page**: Ensure the page is published.
3.  **Verify Frontend**: Access the page URL (e.g., `your-app-url.com/about-us`) on the frontend to confirm it renders correctly with the content you entered. Test different content types (text, images, embedded videos).

## 22. Test Admissions Form

1.  **Access Admissions Page**: Navigate to the admissions section on the frontend (e.g., `your-app-url.com/admissions`).
2.  **Fill and Submit**: Complete and submit a test admissions application form.
3.  **Verify Database**: In the Supabase dashboard, go to "Table Editor" and check the `public.admissions` table. Confirm that the submitted data is recorded.
4.  **Check Notifications**: If email notifications are configured for admissions, verify that the relevant parties receive them.

## 23. Test Contact Form

1.  **Access Contact Page**: Navigate to the contact page on the frontend (e.g., `your-app-url.com/contact`).
2.  **Fill and Submit**: Fill out the contact form with test information and submit it.
3.  **Verify Database**: In the Supabase dashboard, go to "Table Editor" and check the `public.contacts` table. Confirm that the submitted message is recorded.
4.  **Check Notifications**: If email notifications are configured for contact forms, verify that the relevant parties receive them.

## 24. Test SEO Infrastructure

1.  **Robots.txt**: Access `your-app-url.com/robots.txt` and verify its content. Ensure it's correctly configured to allow or disallow crawlers as intended.
2.  **Sitemap.xml**: Access `your-app-url.com/sitemap.xml` and verify it generates correctly, listing all relevant public pages and dynamic content URLs.
3.  **Meta Tags**: Use your browser's "View Page Source" feature on various pages (homepage, dynamic page, notice detail page) to check for:
    *   Correct `<title>` tags.
    *   Meaningful `<meta name="description">` tags.
    *   Open Graph (`og:`) and Twitter Card (`twitter:`) meta tags for social sharing.
    *   Canonical URLs.
4.  **Analytics**: If Google Analytics or other analytics tools are integrated, check their network requests or real-time reports to ensure data is being sent.

## 25. Production Checklist

Before launching to a wider audience:

*   **Domain Configuration**: Map your custom domain (e.g., `your-institution.com`) to your Vercel project.
*   **SSL Certificate**: Vercel automatically handles SSL, but confirm it's active.
*   **Backups**: Establish a regular backup strategy for your Supabase database.
*   **Monitoring & Logging**: Set up monitoring for both your Vercel application and Supabase project.
*   **Analytics Setup**: Ensure all analytics tracking (Google Analytics, GTM, etc.) is fully configured and tested.
*   **Email Service**: Verify that transactional email services (for sign-ups, password resets, contact forms, admissions) are correctly configured and sending emails.
*   **Rate Limiting**: Implement rate limiting for public-facing forms and API endpoints to prevent abuse.
*   **Cache Strategy**: Review and optimize caching strategies for Next.js and Supabase.
*   **Performance Testing**: Conduct load testing if expecting high traffic.

## 26. Security Checklist

Security is paramount for an institutional platform.

*   **Verify RLS**:
    *   Thoroughly test all RLS policies on `public` tables. Attempt to perform unauthorized `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations (e.g., via the Supabase client in the browser console for public tables, or using a non-admin authenticated user). Ensure RLS prevents these actions.
    *   For sensitive tables, ensure only `service_role` or authorized `admin` users can perform mutations.
*   **Verify Storage Policies**:
    *   Test upload attempts to buckets with various user roles. Ensure users can only upload to designated paths/buckets where they have permission.
    *   Verify read access for public assets and restricted access for private ones.
    *   Check for restrictions on file types and sizes as configured.
*   **Verify Admin Protection**:
    *   Attempt to access admin-only routes/APIs as a logged-out user and as a non-admin authenticated user. Confirm they are correctly blocked and redirected.
    *   Ensure all sensitive admin actions require the `admin` role.
*   **Verify Environment Variables**:
    *   Inspect your deployed application's client-side code (browser developer tools, Network tab) to ensure that `SUPABASE_SERVICE_ROLE_KEY` and other sensitive variables **are not** exposed. Only `NEXT_PUBLIC_` variables should be visible.
*   **Verify Service-Role Secrecy**: Reconfirm that the `SUPABASE_SERVICE_ROLE_KEY` is used exclusively in server-side contexts (Next.js API routes, Server Components/Actions) and never transmitted to the client.
*   **Input Validation**: Ensure robust server-side and client-side input validation is in place for all forms and API endpoints to prevent SQL injection, XSS, and other common vulnerabilities.
*   **Dependencies**: Regularly update project dependencies to patch known vulnerabilities.

## 27. Troubleshooting

### Login Failures

*   **Incorrect Credentials**: Double-check email and password.
*   **Email Confirmation**: If email confirmation is enabled in Supabase, ensure the user has verified their email.
*   **RLS on `public.profiles`**: Verify that `public.profiles` has RLS policies allowing authenticated users to read their own profile.
*   **`auth.users` vs `public.profiles` Sync**: Ensure that `public.profiles` records are correctly created or updated when a user signs up. This usually involves a Supabase Trigger/Function.
*   **Middleware Redirects**: If a user is incorrectly redirected after login, check your Next.js middleware logic.

### Bucket Issues

*   **Bucket Not Found**: Ensure the bucket exists in Supabase Storage.
*   **Incorrect Bucket ID**: Verify the bucket ID used in your code matches the one in Supabase.
*   **File Size Limits**: Check if the uploaded file exceeds Supabase's default file size limit (or a custom limit you set).
*   **Permissions**: Most common issue. Review storage policies for the specific bucket and operation (read, write, delete).

### Upload Failures

*   **Storage Policies**: Ensure the user role attempting the upload has `INSERT` and `UPDATE` permissions on the target bucket. Check `USING` and `WITH CHECK` clauses.
*   **File Type/Path Restrictions**: Some policies might restrict file types or paths.
*   **Client-Side Errors**: Check browser console for network errors during upload.

### Deployment Failures (Vercel)

*   **Missing Environment Variables**: The most common cause. Double-check that all required environment variables are added to Vercel for the correct environments (Production, Preview, Development).
*   **Build Errors**: Review Vercel's build logs thoroughly. This could be due to syntax errors, missing dependencies, or TypeScript errors.
*   **`package.json` Issues**: Ensure all dependencies are correctly listed and compatible.
*   **Node.js Version**: Verify the Node.js version specified in Vercel (or via `.nvmrc`) is compatible with your project.

### Missing Tables or Data

*   **`setup.sql` Not Run**: Ensure the `setup.sql` script was executed successfully in the Supabase SQL Editor.
*   **Partial Execution**: If `setup.sql` is large, it might have failed partially. Review the SQL Editor history.
*   **Schema Conflicts**: If tables already existed, new `CREATE TABLE` statements might have failed. Drop existing tables if performing a clean deploy.

### RLS Problems

*   **Data Not Appearing**: If logged-in users cannot see data they should, RLS policies might be too restrictive.
    *   **Debug with Service Role**: In the Supabase SQL Editor, you can temporarily bypass RLS with `SET ROLE service_role;` to verify data exists, then revert with `RESET ROLE;`.
    *   **Test Policies**: Use `SET auth.uid() = 'some-uuid'` and `SET role 'authenticated'` to test policies as a specific user.
*   **Unauthorized Access**: If users can see data they shouldn't, RLS policies are too permissive or incorrectly configured.

### Middleware Redirects

*   **Auth State Mismatch**: Ensure your Next.js middleware correctly reads and processes Supabase authentication tokens.
*   **Looping Redirects**: Check for infinite redirect loops in your middleware logic, especially around `/auth` routes or protected routes.
*   **Environment Variables for Redirects**: Ensure `NEXT_PUBLIC_APP_URL` and other URL-related environment variables are correctly set.

## 28. FAQ

*   **Q: How do I handle database migrations for future updates?**
    *   A: Supabase recommends using a migration tool (e.g., `supabase-cli`, `migrate-mongo`). For schema changes, you'll generate new SQL migration files and apply them to your database. RLS policies and functions also require careful versioning.
*   **Q: Can I use custom domains for my white-label instances?**
    *   A: Yes, Vercel fully supports custom domains. Each institution can have its own domain mapped to the same Vercel project, with dynamic routing or environment variables determining the specific branding and content.
*   **Q: How do I manage backups for my Supabase database?**
    *   A: Supabase offers daily automated backups. For critical applications, consider implementing additional backup strategies using `pg_dump` or Supabase's point-in-time recovery features (on paid plans).
*   **Q: What about scaling Supabase for a large number of institutions/users?**
    *   A: Supabase is built on PostgreSQL, which is highly scalable. For larger loads, consider upgrading your Supabase plan, optimizing queries, using database indices, and potentially read replicas. Vercel automatically scales your Next.js frontend.
*   **Q: How can I debug Supabase RLS policies effectively?**
    *   A: Use the Supabase SQL Editor to test policies by setting specific `auth.uid()` and `role` variables. `SELECT * FROM pg_policies;` can show all policies. The Supabase documentation also has detailed guides.
*   **Q: Is local development with Supabase possible?**
    *   A: Yes, you can use Supabase CLI to run a local Supabase instance, or connect your local development environment directly to your remote Supabase project using the remote Supabase URL and Anon key.
*   **Q: What if I need different branding/settings for multiple institutions from a single codebase?**
    *   A: The platform is designed for this. Use environment variables (if deploying separate instances) or dynamic content loading based on the domain/subdomain or a `tenant_id` from the database to serve distinct branding and content. The `branding` bucket and `public.institutions` table are key to this.