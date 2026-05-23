export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Role = 'freelancer' | 'client' | 'admin';

type TableShape<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<{
        id: string;
        auth_user_id: string | null;
        full_name: string;
        email: string;
        phone: string | null;
        role: Role;
        avatar_url: string | null;
        is_active: boolean | null;
        created_at: string | null;
        updated_at: string | null;
      }, {
        id?: string;
        auth_user_id?: string | null;
        full_name: string;
        email: string;
        phone?: string | null;
        role: Role;
        avatar_url?: string | null;
        is_active?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
      }>;
      clients: TableShape<{
        id: string;
        freelancer_id: string | null;
        name: string;
        email: string;
        phone: string | null;
        company_name: string | null;
        notes: string | null;
        status: 'active' | 'inactive' | 'archived' | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
      projects: TableShape<{
        id: string;
        freelancer_id: string | null;
        client_id: string | null;
        name: string;
        description: string | null;
        tech_stack: string | null;
        project_url: string | null;
        github_url: string | null;
        status: 'planning' | 'active' | 'testing' | 'completed' | 'on_hold' | 'cancelled' | null;
        start_date: string | null;
        deadline: string | null;
        budget: number | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
      bugs: TableShape<{
        id: string;
        project_id: string | null;
        reported_by: string | null;
        assigned_to: string | null;
        title: string;
        description: string | null;
        steps_to_reproduce: string | null;
        expected_result: string | null;
        actual_result: string | null;
        browser_info: string | null;
        device_info: string | null;
        page_url: string | null;
        priority: 'low' | 'medium' | 'high' | 'urgent' | null;
        severity: 'minor' | 'major' | 'critical' | 'blocker' | null;
        status: 'new' | 'accepted' | 'in_progress' | 'fixed' | 'client_review' | 'reopened' | 'closed' | 'rejected' | null;
        due_date: string | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
      bug_comments: TableShape<{
        id: string;
        bug_id: string | null;
        user_id: string | null;
        comment: string;
        created_at: string | null;
      }>;
      bug_attachments: TableShape<{
        id: string;
        bug_id: string | null;
        uploaded_by: string | null;
        file_name: string;
        file_url: string;
        file_type: string | null;
        file_size: number | null;
        created_at: string | null;
      }>;
      bug_activity_logs: TableShape<{
        id: string;
        bug_id: string | null;
        user_id: string | null;
        action: string;
        old_value: Json | null;
        new_value: Json | null;
        created_at: string | null;
      }>;
      invoices: TableShape<{
        id: string;
        client_id: string | null;
        project_id: string | null;
        invoice_number: string;
        amount: number | null;
        tax: number | null;
        discount: number | null;
        total: number | null;
        status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | null;
        due_date: string | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
      notifications: TableShape<{
        id: string;
        user_id: string | null;
        title: string;
        message: string;
        type: string | null;
        is_read: boolean | null;
        created_at: string | null;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type BugRow = Database['public']['Tables']['bugs']['Row'];
export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
