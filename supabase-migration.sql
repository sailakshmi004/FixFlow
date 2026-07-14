-- Full schema for FixFlow (run this in Supabase SQL editor to set up all tables)
-- This includes the `type` column (bug/change_request) on the bugs table.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('freelancer', 'client', 'admin')),
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  tech_stack text,
  project_url text,
  github_url text,
  status text DEFAULT 'active' CHECK (status IN ('planning', 'active', 'testing', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  deadline date,
  budget numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bugs table (with type column)
CREATE TABLE IF NOT EXISTS bugs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text DEFAULT 'bug' CHECK (type IN ('bug', 'change_request')),
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  browser_info text,
  device_info text,
  page_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  severity text DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical', 'blocker')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'declined', 'completed')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bug comments table
CREATE TABLE IF NOT EXISTS bug_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id uuid REFERENCES bugs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Bug attachments table
CREATE TABLE IF NOT EXISTS bug_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id uuid REFERENCES bugs(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

-- Bug activity logs table
CREATE TABLE IF NOT EXISTS bug_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bug_id uuid REFERENCES bugs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  amount numeric(12,2),
  tax numeric(12,2),
  discount numeric(12,2),
  total numeric(12,2),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time entries table (for freelancer time tracking)
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  description text,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_seconds bigint,
  hourly_rate numeric(12,2),
  is_running boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (run after tables are created)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
-- Drop existing policies first so the script is idempotent
-- Profiles: users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- Clients: freelancers can CRUD their own clients; clients can read their own record
DROP POLICY IF EXISTS "Freelancers manage own clients" ON clients;
CREATE POLICY "Freelancers manage own clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = clients.freelancer_id AND auth_user_id = auth.uid())
);
DROP POLICY IF EXISTS "Clients can view own client record" ON clients;
CREATE POLICY "Clients can view own client record" ON clients FOR SELECT USING (
  email = auth.email()
);

-- Projects: freelancers manage, clients can view assigned
DROP POLICY IF EXISTS "Freelancers manage own projects" ON projects;
CREATE POLICY "Freelancers manage own projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = projects.freelancer_id AND auth_user_id = auth.uid())
);
DROP POLICY IF EXISTS "Clients view assigned projects" ON projects;
CREATE POLICY "Clients view assigned projects" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.email = (SELECT email FROM profiles WHERE auth_user_id = auth.uid()))
);

-- Bugs: related users can view
DROP POLICY IF EXISTS "Users can view bugs on their projects" ON bugs;
CREATE POLICY "Users can view bugs on their projects" ON bugs FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bugs.project_id AND (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = projects.freelancer_id AND profiles.auth_user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.email = (SELECT email FROM profiles WHERE auth_user_id = auth.uid()))
  ))
);
DROP POLICY IF EXISTS "Clients can create bugs" ON bugs;
CREATE POLICY "Clients can create bugs" ON bugs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bugs.project_id AND (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.email = auth.email())
  ))
);
DROP POLICY IF EXISTS "Freelancers can update bugs" ON bugs;
CREATE POLICY "Freelancers can update bugs" ON bugs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bugs.project_id AND (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = projects.freelancer_id AND profiles.auth_user_id = auth.uid())
  ))
);
DROP POLICY IF EXISTS "Freelancers can create bugs" ON bugs;
CREATE POLICY "Freelancers can create bugs" ON bugs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = bugs.project_id AND (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = projects.freelancer_id AND profiles.auth_user_id = auth.uid())
  ))
);

-- Time entries: freelancers can CRUD their own entries
DROP POLICY IF EXISTS "Freelancers manage own time entries" ON time_entries;
CREATE POLICY "Freelancers manage own time entries" ON time_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = time_entries.freelancer_id AND auth_user_id = auth.uid())
);

INSERT INTO storage.buckets (id, name, public) VALUES ('bug-attachments', 'bug-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'bug-attachments');
DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;
CREATE POLICY "Authenticated upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bug-attachments' AND auth.role() = 'authenticated');
