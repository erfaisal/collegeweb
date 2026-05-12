# Lumina CMS — Enterprise Institutional Platform
Lumina CMS is a modern, scalable, and highly modular Content Management System (CMS) purpose-built for large-scale educational and healthcare institutions.
Engineered with cutting-edge web technologies, it provides a unified platform to manage complex digital presences for **Medical Colleges, Engineering Universities, K-12 Schools, and Teaching Hospitals**.
## 📖 Overview
Unlike traditional monolithic CMS solutions, Lumina CMS is designed around a **modular architecture**. Institutions can toggle specific features—such as Hospital Services, Hostel Management, or Admissions CRM—on or off based on their unique operational needs.
The entire platform is heavily database-driven and **dynamically admin-controlled**, meaning navigation, homepage layouts, themes, and SEO metadata can be updated in real-time by authorized staff without requiring developer intervention or code deployments.
## ✨ Features
 * **Dynamic Homepage Builder:** Construct and reorder institutional landing pages using modular sections (Hero, About, Testimonials, Grid Layouts).
 * **Comprehensive Admin Panel:** A secure, intuitive dashboard for staff to manage all aspects of the institution's digital footprint.
 * **Modular Content Systems:**
   * **Faculty CMS:** Manage academic staff profiles, departments, and qualifications.
   * **Notices CMS:** Publish circulars, exam schedules, and important PDF documents.
   * **Gallery CMS:** Showcase campus life, infrastructure, and events.
 * **Admissions CRM:** Integrated lead capture and student inquiry management.
 * **Role-Based Access Control (RBAC):** Granular permissions ensuring staff only access the modules they are authorized to manage.
 * **Global SEO System:** Fine-grained metadata, Open Graph, and JSON-LD structured data management for optimal discoverability.
 * **Dynamic Navigation:** Database-driven header menus, mega-menus, and footer links.
 * **Centralized Media Library:** A unified asset manager for images, PDFs, and videos with public CDN capabilities.
 * **Audit Logging:** Enterprise-grade tracking of all administrative actions (creates, updates, deletes) for security and compliance.
 * **Dynamic Themes:** Switchable branding profiles with customizable primary, secondary, and accent colors to match institutional identity.
## 🛠 Tech Stack
Built for the modern web, ensuring unparalleled performance, security, and developer experience.
 * **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
 * **Backend & Auth:** Supabase (PostgreSQL, Storage, Authentication)
 * **Styling:** Tailwind CSS
 * **Language:** TypeScript
 * **Deployment:** Vercel (Edge caching, CI/CD)
## 🏗 Architecture Highlights
 * **Scalable CMS Architecture:** Built on top of PostgreSQL, utilizing relational data models optimized for high-read, heavy-content environments.
 * **Service-Layer Design:** Clean separation of concerns. Database interactions are abstracted into dedicated TypeScript service files (src/services/*), keeping UI components pure and testable.
 * **Row Level Security (RLS):** Data access is secured directly at the database level. Public users can only query published/visible content, while authenticated staff bypass specific restrictions based on their JWT claims.
 * **Modular Extensibility:** The modules registry table acts as a central nervous system. Disabling a module globally removes its data from the API responses, navigation, and admin panel instantaneously.
## 📂 Folder Structure
```text
lumina-cms/
├── src/
│   ├── app/              # Next.js App Router (Public Site & /admin routes)
│   ├── components/       # Reusable React components (UI, Forms, Layouts)
│   ├── lib/              # Utility functions and Supabase client initialization
│   ├── services/         # Data access layer (e.g., pages.ts, media.ts)
│   └── types/            # TypeScript interfaces and database schemas
├── supabase/             # Database initialization and management
│   ├── schema.sql        # Table definitions and triggers
│   ├── policies.sql      # Row Level Security (RLS) policies
│   ├── buckets.sql       # Storage bucket provisioning
│   ├── seed.sql          # Placeholder institutional data
│   └── setup.md          # Database setup instructions
├── public/               # Static assets (favicons, default logos)
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.mjs       # Next.js configuration

```
## 🚀 Setup Instructions
Setting up the Lumina CMS involves provisioning the Supabase database and configuring the Next.js environment.
For detailed, step-by-step instructions on running the SQL scripts and connecting your local environment, please refer to the primary setup guide:
👉 **View Database & Project Setup Guide**
## 🌍 Deployment
The platform is optimized for zero-config deployment on Vercel.
 1. Push your repository to GitHub, GitLab, or Bitbucket.
 2. Import the project into **Vercel**.
 3. Add the following environment variables in the Vercel dashboard:
   * NEXT_PUBLIC_SUPABASE_URL
   * NEXT_PUBLIC_SUPABASE_ANON_KEY
 4. Click **Deploy**. Vercel will automatically detect the Next.js 14 framework and optimize the build.
## 🗺 Roadmap
Lumina CMS is continuously evolving to support enterprise-scale institutional needs:
 * [ ] **Multi-Tenant SaaS Architecture:** Upgrade the schema with tenant_id to host hundreds of schools from a single database instance.
 * [ ] **Drag-and-Drop Homepage Builder:** Implement visual, block-based editing for the dynamic homepage sections.
 * [ ] **Native Analytics Dashboard:** Integrate privacy-friendly web analytics directly into the admin panel.
 * [ ] **Multilingual Support:** Database-level internationalization (i18n) for global universities.
 * [ ] **AI-Powered Content Tools:** Automated SEO generation, alt-text tagging, and content summarization using generative AI.
## 📸 Screenshots
*(Add screenshots of the public-facing site and the secure admin dashboard here)*
### Public Homepage
> [Placeholder: public_homepage.png]
> 
### Admin Dashboard Overview
> [Placeholder: admin_dashboard.png]
> 
### Media Library Management
> [Placeholder: admin_media_library.png]
> 
## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
