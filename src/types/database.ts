export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admission_inquiries: {
        Row: {
          assigned_to_user_id: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          message: string;
          metadata: Json | null;
          phone: string | null;
          program_of_interest: string;
          source: string;
          status: 'new' | 'in_progress' | 'resolved' | 'spam';
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          assigned_to_user_id?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          message: string;
          metadata?: Json | null;
          phone?: string | null;
          program_of_interest: string;
          source?: string;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          assigned_to_user_id?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          message?: string;
          metadata?: Json | null;
          phone?: string | null;
          program_of_interest?: string;
          source?: string;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_inquiries_assigned_to_user_id_fkey";
            columns: ["assigned_to_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          browser: string | null;
          created_at: string;
          device_type: string | null;
          event_name: string;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          os: string | null;
          page_path: string | null;
          page_title: string | null;
          referrer: string | null;
          session_id: string | null;
          tenant_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          browser?: string | null;
          created_at?: string;
          device_type?: string | null;
          event_name: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          os?: string | null;
          page_path?: string | null;
          page_title?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          tenant_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          browser?: string | null;
          created_at?: string;
          device_type?: string | null;
          event_name?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          os?: string | null;
          page_path?: string | null;
          page_title?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          new_value: Json | null;
          old_value: Json | null;
          tenant_id: string;
          updated_at: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          new_value?: Json | null;
          old_value?: Json | null;
          tenant_id: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          new_value?: Json | null;
          old_value?: Json | null;
          tenant_id?: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      backups: {
        Row: {
          backup_name: string;
          backup_type: 'full' | 'incremental' | 'manual';
          created_at: string;
          created_by: string | null;
          id: string;
          metadata: Json | null;
          size_bytes: number | null;
          status: 'pending' | 'completed' | 'failed';
          storage_path: string;
          tenant_id: string | null;
          updated_at: string;
        };
        Insert: {
          backup_name: string;
          backup_type?: 'full' | 'incremental' | 'manual';
          created_at?: string;
          created_by?: string | null;
          id?: string;
          metadata?: Json | null;
          size_bytes?: number | null;
          status?: 'pending' | 'completed' | 'failed';
          storage_path: string;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Update: {
          backup_name?: string;
          backup_type?: 'full' | 'incremental' | 'manual';
          created_at?: string;
          created_by?: string | null;
          id?: string;
          metadata?: Json | null;
          size_bytes?: number | null;
          status?: 'pending' | 'completed' | 'failed';
          storage_path?: string;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "backups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_inquiries: {
        Row: {
          assigned_to_user_id: string | null;
          category: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          message: string;
          metadata: Json | null;
          phone: string | null;
          status: 'new' | 'in_progress' | 'resolved' | 'spam';
          subject: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          assigned_to_user_id?: string | null;
          category?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          message: string;
          metadata?: Json | null;
          phone?: string | null;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          subject?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          assigned_to_user_id?: string | null;
          category?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          message?: string;
          metadata?: Json | null;
          phone?: string | null;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          subject?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_assigned_to_user_id_fkey";
            columns: ["assigned_to_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          description: string | null;
          head_of_department_id: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          slug: string;
          tenant_id: string;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          head_of_department_id?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          slug: string;
          tenant_id: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          head_of_department_id?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          slug?: string;
          tenant_id?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "departments_head_of_department_id_fkey";
            columns: ["head_of_department_id"];
            isOneToOne: false;
            referencedRelation: "faculty_members";
            referencedColumns: ["id"];
          },
        ];
      };
      faculty_members: {
        Row: {
          bio: string | null;
          created_at: string;
          department_id: string | null;
          email: string | null;
          first_name: string;
          id: string;
          is_active: boolean;
          last_name: string;
          metadata: Json | null;
          office_location: string | null;
          phone: string | null;
          position: string | null;
          profile_picture_url: string | null;
          publications_url: string | null;
          research_interests: string[] | null;
          tenant_id: string;
          title: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          department_id?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          is_active?: boolean;
          last_name: string;
          metadata?: Json | null;
          office_location?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_picture_url?: string | null;
          publications_url?: string | null;
          research_interests?: string[] | null;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          department_id?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          is_active?: boolean;
          last_name?: string;
          metadata?: Json | null;
          office_location?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_picture_url?: string | null;
          publications_url?: string | null;
          research_interests?: string[] | null;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "faculty_members_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "faculty_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery_images: {
        Row: {
          album_name: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string;
          is_featured: boolean;
          order: number | null;
          published_at: string | null;
          tenant_id: string;
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          album_name?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url: string;
          is_featured?: boolean;
          order?: number | null;
          published_at?: string | null;
          tenant_id: string;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          album_name?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string;
          is_featured?: boolean;
          order?: number | null;
          published_at?: string | null;
          tenant_id?: string;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_sections: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          metadata: Json | null;
          order: number;
          section_type: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json | null;
          order: number;
          section_type: string;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json | null;
          order?: number;
          section_type?: string;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hospital_departments: {
        Row: {
          contact_number: string | null;
          created_at: string;
          description: string | null;
          head_of_department: string | null;
          id: string;
          location: string | null;
          metadata: Json | null;
          name: string;
          services_offered: string[] | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          contact_number?: string | null;
          created_at?: string;
          description?: string | null;
          head_of_department?: string | null;
          id?: string;
          location?: string | null;
          metadata?: Json | null;
          name: string;
          services_offered?: string[] | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          contact_number?: string | null;
          created_at?: string;
          description?: string | null;
          head_of_department?: string | null;
          id?: string;
          location?: string | null;
          metadata?: Json | null;
          name?: string;
          services_offered?: string[] | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hostel_facilities: {
        Row: {
          amenities: string[] | null;
          capacity: number | null;
          contact_email: string | null;
          contact_person: string | null;
          contact_phone: string | null;
          created_at: string;
          description: string | null;
          gender_specific: 'male' | 'female' | 'mixed' | null;
          id: string;
          location: string | null;
          metadata: Json | null;
          name: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          amenities?: string[] | null;
          capacity?: number | null;
          contact_email?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          gender_specific?: 'male' | 'female' | 'mixed' | null;
          id?: string;
          location?: string | null;
          metadata?: Json | null;
          name: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          amenities?: string[] | null;
          capacity?: number | null;
          contact_email?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          gender_specific?: 'male' | 'female' | 'mixed' | null;
          id?: string;
          location?: string | null;
          metadata?: Json | null;
          name?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_files: {
        Row: {
          alt_text: string | null;
          created_at: string;
          description: string | null;
          file_name: string;
          file_url: string;
          folder: string | null;
          id: string;
          is_public: boolean;
          metadata: Json | null;
          mime_type: string;
          size_bytes: number | null;
          tenant_id: string;
          updated_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          description?: string | null;
          file_name: string;
          file_url: string;
          folder?: string | null;
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          mime_type: string;
          size_bytes?: number | null;
          tenant_id: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          description?: string | null;
          file_name?: string;
          file_url?: string;
          folder?: string | null;
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          mime_type?: string;
          size_bytes?: number | null;
          tenant_id?: string;
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_files_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          config: Json | null;
          created_at: string;
          id: string;
          is_active: boolean;
          is_global: boolean;
          module_type: string;
          name: string;
          order: number | null;
          page_id: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          config?: Json | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_global?: boolean;
          module_type: string;
          name: string;
          order?: number | null;
          page_id?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          config?: Json | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_global?: boolean;
          module_type?: string;
          name?: string;
          order?: number | null;
          page_id?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      navigation_items: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          location: 'header' | 'footer' | 'sidebar' | string;
          order: number;
          page_id: string | null;
          parent_id: string | null;
          target: '_self' | '_blank' | null;
          tenant_id: string;
          title: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location: 'header' | 'footer' | 'sidebar' | string;
          order: number;
          page_id?: string | null;
          parent_id?: string | null;
          target?: '_self' | '_blank' | null;
          tenant_id: string;
          title: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          location?: 'header' | 'footer' | 'sidebar' | string;
          order?: number;
          page_id?: string | null;
          parent_id?: string | null;
          target?: '_self' | '_blank' | null;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "navigation_items_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "navigation_items";
            referencedColumns: ["id"];
          },
        ];
      };
      notices: {
        Row: {
          attachment_url: string | null;
          category: string | null;
          content: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          metadata: Json | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          published_at: string;
          status: 'draft' | 'published' | 'archived';
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          attachment_url?: string | null;
          category?: string | null;
          content: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          published_at?: string;
          status?: 'draft' | 'published' | 'archived';
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          attachment_url?: string | null;
          category?: string | null;
          content?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          published_at?: string;
          status?: 'draft' | 'published' | 'archived';
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          link: string | null;
          message: string;
          metadata: Json | null;
          read_at: string | null;
          tenant_id: string;
          title: string;
          type: 'info' | 'warning' | 'error' | 'success' | 'alert';
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          link?: string | null;
          message: string;
          metadata?: Json | null;
          read_at?: string | null;
          tenant_id: string;
          title: string;
          type?: 'info' | 'warning' | 'error' | 'success' | 'alert';
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          link?: string | null;
          message?: string;
          metadata?: Json | null;
          read_at?: string | null;
          tenant_id?: string;
          title?: string;
          type?: 'info' | 'warning' | 'error' | 'success' | 'alert';
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          author_id: string | null;
          content: string | null;
          created_at: string;
          id: string;
          is_homepage: boolean;
          metadata: Json | null;
          parent_id: string | null;
          published_at: string | null;
          slug: string;
          status: 'draft' | 'published' | 'archived';
          template: string | null;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          is_homepage?: boolean;
          metadata?: Json | null;
          parent_id?: string | null;
          published_at?: string | null;
          slug: string;
          status?: 'draft' | 'published' | 'archived';
          template?: string | null;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          is_homepage?: boolean;
          metadata?: Json | null;
          parent_id?: string | null;
          published_at?: string | null;
          slug?: string;
          status?: 'draft' | 'published' | 'archived';
          template?: string | null;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pages_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          is_allowed: boolean;
          resource: string;
          role_id: string | null;
          scope: string | null;
          tenant_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          is_allowed?: boolean;
          resource: string;
          role_id?: string | null;
          scope?: string | null;
          tenant_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          is_allowed?: boolean;
          resource?: string;
          role_id?: string | null;
          scope?: string | null;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "user_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "permissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_metadata: {
        Row: {
          canonical_url: string | null;
          created_at: string;
          description: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          keywords: string[] | null;
          metadata: Json | null;
          no_follow: boolean;
          no_index: boolean;
          og_description: string | null;
          og_image_url: string | null;
          og_title: string | null;
          page_id: string | null;
          tenant_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_url?: string | null;
          created_at?: string;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          keywords?: string[] | null;
          metadata?: Json | null;
          no_follow?: boolean;
          no_index?: boolean;
          og_description?: string | null;
          og_image_url?: string | null;
          og_title?: string | null;
          page_id?: string | null;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_url?: string | null;
          created_at?: string;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          keywords?: string[] | null;
          metadata?: Json | null;
          no_follow?: boolean;
          no_index?: boolean;
          og_description?: string | null;
          og_image_url?: string | null;
          og_title?: string | null;
          page_id?: string | null;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_metadata_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          is_public: boolean;
          metadata: Json | null;
          setting_key: string;
          setting_value: Json;
          tenant_id: string | null;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          setting_key: string;
          setting_value: Json;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          metadata?: Json | null;
          setting_key?: string;
          setting_value?: Json;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          config: Json | null;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          preview_image_url: string | null;
          tenant_id: string | null;
          updated_at: string;
          version: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          preview_image_url?: string | null;
          tenant_id?: string | null;
          updated_at?: string;
          version?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          preview_image_url?: string | null;
          tenant_id?: string | null;
          updated_at?: string;
          version?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          assigned_by_user_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          metadata: Json | null;
          role_name: string;
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assigned_by_user_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json | null;
          role_name: string;
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assigned_by_user_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json | null;
          role_name?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_user_id_fkey";
            columns: ["assigned_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions]
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    keyof Database["public"]["Tables"]
    | { schema: keyof Database },
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Insert"]
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    keyof Database["public"]["Tables"]
    | { schema: keyof Database },
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Update"]
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    keyof Database["public"]["Enums"]
    | { schema: keyof Database },
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;