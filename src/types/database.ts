export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          date_time: string;
          venue_name: string | null;
          venue_address: string | null;
          city: string;
          description: string | null;
          category: string | null;
          tags: string[];
          image_url: string | null;
          source_website: string;
          original_url: string;
          status: 'new' | 'updated' | 'inactive' | 'imported';
          last_scraped_at: string | null;
          imported_at: string | null;
          imported_by: string | null;
          import_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date_time: string;
          venue_name?: string | null;
          venue_address?: string | null;
          city?: string;
          description?: string | null;
          category?: string | null;
          tags?: string[];
          image_url?: string | null;
          source_website: string;
          original_url: string;
          status?: 'new' | 'updated' | 'inactive' | 'imported';
          last_scraped_at?: string | null;
          imported_at?: string | null;
          imported_by?: string | null;
          import_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date_time?: string;
          venue_name?: string | null;
          venue_address?: string | null;
          city?: string;
          description?: string | null;
          category?: string | null;
          tags?: string[];
          image_url?: string | null;
          source_website?: string;
          original_url?: string;
          status?: 'new' | 'updated' | 'inactive' | 'imported';
          last_scraped_at?: string | null;
          imported_at?: string | null;
          imported_by?: string | null;
          import_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_captures: {
        Row: {
          id: string;
          email: string;
          consent_given: boolean;
          event_id: string;
          captured_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          consent_given: boolean;
          event_id: string;
          captured_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          consent_given?: boolean;
          event_id?: string;
          captured_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          last_login_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          last_login_at?: string;
        };
      };
    };
  };
};

export type Event = Database['public']['Tables']['events']['Row'];
export type EmailCapture = Database['public']['Tables']['email_captures']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
