# FixFlow - Project Requirements Document

## 1. Project Overview

### Project Name

FixFlow

### Tagline

Client-friendly bug tracking for freelance developers.

### One-Line Description

FixFlow is a web-based bug tracking and client collaboration platform designed for freelance developers to manage clients, projects, bug reports, screenshots, comments, approvals, and invoices in one place.

### Main Goal

The goal of FixFlow is to help freelance developers avoid scattered client communication across WhatsApp, email, calls, screenshots, and spreadsheets by providing a structured platform where clients can report bugs clearly and freelancers can manage the complete bug resolution workflow.

## 2. Problem Statement

Freelance developers often receive client issues through different channels such as WhatsApp, email, phone calls, screenshots, screen recordings, and documents. This creates confusion because bug details are scattered and difficult to track.

Common problems include:

- Clients send unclear bug reports.
- Screenshots and videos are shared separately.
- Developers forget which bugs are fixed or pending.
- Clients do not know the current status of reported issues.
- Bugs are closed without proper client approval.
- Invoices and payment status are tracked separately.
- There is no proper activity history for bug changes.

FixFlow solves this by providing a single platform for bug reporting, tracking, communication, approval, and invoice management.

## 3. Target Users

### 3.1 Freelancer Developer

The main user of the platform. A freelancer manages clients, projects, bugs, comments, attachments, invoices, and delivery approvals.

### 3.2 Client

A non-technical or semi-technical user who reports bugs, uploads screenshots/videos, comments on issues, approves fixes, reopens bugs, and views invoices.

### 3.3 Admin

The platform owner or system administrator who manages users, monitors projects, and can later manage subscriptions.

## 4. User Roles and Permissions

### Roles

```text
freelancer
client
admin
```

### Freelancer Permissions

A freelancer can:

- Register and login.
- Create and manage clients.
- Create and manage projects.
- Assign clients to projects.
- Create bugs manually.
- View bugs reported by clients.
- Update bug priority, severity, and status.
- Add comments to bugs.
- Upload bug attachments.
- View bug activity timeline.
- Send bugs for client review.
- Create and manage invoices.
- View dashboard statistics.

### Client Permissions

A client can:

- Register and login.
- View assigned projects.
- Report bugs for assigned projects.
- Upload screenshots/videos/documents.
- Add comments on bugs.
- Track bug status.
- Approve fixed bugs.
- Reopen bugs if not fixed properly.
- View invoices.

### Admin Permissions

An admin can:

- Login to admin dashboard.
- View all users.
- View all projects.
- View all bugs.
- Manage user status.
- Monitor platform activity.
- Manage subscriptions later.

## 5. Core Concept

FixFlow should not be built as a Jira clone. It should be built as a simple and client-friendly platform for freelancers.

The unique combination is:

```text
Bug tracking + client portal + freelancer workflow + approval flow + invoice tracking
```

## 6. Main Workflow

### 6.1 Freelancer Workflow

```text
Freelancer registers/logs in
↓
Creates client
↓
Creates project for client
↓
Client reports bug OR freelancer creates bug
↓
Freelancer reviews bug
↓
Freelancer updates bug status
↓
Freelancer fixes bug
↓
Freelancer sends bug for client review
↓
Client approves or reopens
↓
Bug is closed after approval
↓
Freelancer creates invoice
↓
Payment status is tracked
```

### 6.2 Client Workflow

```text
Client logs in
↓
Views assigned projects
↓
Reports bug
↓
Uploads screenshot/video
↓
Tracks bug status
↓
Adds comments if needed
↓
Reviews fixed bug
↓
Approves or reopens bug
↓
Views invoice
```

## 7. Bug Status Workflow

### Status Values

```text
new
accepted
in_progress
fixed
client_review
reopened
closed
rejected
```

### Normal Bug Flow

```text
new → accepted → in_progress → fixed → client_review → closed
```

### Reopen Flow

```text
client_review → reopened → in_progress → fixed → client_review → closed
```

### Rejected Flow

```text
new → rejected
```

### Rules

- A client can create a bug with status `new`.
- A freelancer can accept a bug and move it to `accepted`.
- A freelancer can move a bug to `in_progress`.
- A freelancer can mark a bug as `fixed`.
- A freelancer can send a fixed bug to `client_review`.
- A client can approve the bug, which changes status to `closed`.
- A client can reopen the bug, which changes status to `reopened`.
- A freelancer can reject invalid bugs with a reason.
- A bug should not be closed directly by the freelancer without client review, unless the bug was created internally by the freelancer.

## 8. Main Modules

## 8.1 Authentication Module

### Features

- Register
- Login
- Logout
- Forgot password
- Role-based dashboard redirect
- Protected routes

### Registration Fields

```text
Full name
Email
Password
Confirm password
Role: freelancer/client/admin
```

- Registration flow should reflect all supported roles, including admin.
- Admin accounts are intended for platform owners or internal access.

### Login Fields

```text
Email
Password
```

### Role-Based Redirect

```text
freelancer → /freelancer/dashboard
client → /client/dashboard
admin → /admin/dashboard
```

## 8.2 Freelancer Dashboard Module

### Dashboard Cards

Show:

```text
Total clients
Total projects
Open bugs
Urgent bugs
Bugs in progress
Bugs waiting for client review
Closed bugs
Pending invoices
Overdue invoices
```

### Dashboard Sections

- Recent bugs
- Recent client comments
- Upcoming project deadlines
- Pending client reviews
- Pending invoices

## 8.3 Client Management Module

### Purpose

Freelancers should be able to manage their clients.

### Features

- Add client
- Edit client
- View client details
- Archive client
- Search clients
- Filter by status

### Client Fields

```text
id
freelancer_id
name
email
phone
company_name
notes
status
created_at
updated_at
```

### Client Status

```text
active
inactive
archived
```

### UI Requirements

- Client table with search.
- Add/edit client dialog or page.
- Status badge.
- Client detail page showing projects and invoices.

## 8.4 Project Management Module

### Purpose

Freelancers should be able to create and manage projects for clients.

### Features

- Create project
- Edit project
- Delete/archive project
- Assign project to client
- Add project URL
- Add GitHub repository URL
- Set deadline
- Set budget
- View project bugs
- View project invoices

### Project Fields

```text
id
freelancer_id
client_id
name
description
tech_stack
project_url
github_url
status
start_date
deadline
budget
created_at
updated_at
```

### Project Status

```text
planning
active
testing
completed
on_hold
cancelled
```

### UI Requirements

- Project table with filters.
- Project cards for dashboard.
- Project detail page.
- Project status badge.
- Project should show linked client.

## 8.5 Bug Tracking Module

### Purpose

This is the main module of FixFlow.

### Features

- Create bug
- View bug list
- View bug details
- Update bug status
- Update priority
- Update severity
- Add due date
- Assign bug to freelancer
- Add comments
- Upload attachments
- View activity timeline
- Client approval/reopen flow

### Bug Fields

```text
id
project_id
reported_by
assigned_to
title
description
steps_to_reproduce
expected_result
actual_result
browser_info
device_info
page_url
priority
severity
status
due_date
created_at
updated_at
```

### Priority Values

```text
low
medium
high
urgent
```

### Severity Values

```text
minor
major
critical
blocker
```

### Bug List Requirements

Bug list should show:

```text
Bug title
Project name
Client name
Priority
Severity
Status
Reported by
Created date
Due date
Actions
```

### Bug Detail Page Requirements

Bug detail page should show:

```text
Bug title
Description
Steps to reproduce
Expected result
Actual result
Browser/device info
Page URL
Priority
Severity
Status
Attachments
Comments
Activity timeline
Status action buttons
```

## 8.6 Client Portal Module

### Purpose

Clients should have a simple and clean portal without complex developer features.

### Client Portal Pages

```text
/client/dashboard
/client/projects
/client/projects/[id]
/client/bugs
/client/bugs/[id]
/client/invoices
```

### Client Dashboard Should Show

```text
My projects
Open bugs
Bugs waiting for my review
Recently fixed bugs
Pending invoices
Latest comments
```

### Client Can

- View assigned projects.
- Report bugs only for assigned projects.
- View bugs they reported.
- Comment on bugs.
- Upload attachments.
- Approve fixed bugs.
- Reopen bugs.
- View invoices.

### Client UI Rule

Client interface must be simple, clean, and non-technical.

Use labels like:

```text
Report Issue
View Progress
Approve Fix
Request Changes
```

Instead of overly technical terms.

## 8.7 Comments Module

### Features

- Add comment to bug.
- View all comments under bug.
- Show comment author name and role.
- Show comment created time.
- Support freelancer and client comments.

### Comment Fields

```text
id
bug_id
user_id
comment
created_at
```

### Rules

- Only users related to the project can comment.
- Empty comments should not be allowed.
- Comments should appear in chronological order.

## 8.8 Attachments Module

### Features

- Upload screenshot.
- Upload screen recording.
- Upload PDF/document.
- View attachments in bug detail.
- Download attachment.
- Delete attachment if uploaded by same user or freelancer.

### Allowed File Types

```text
jpg
jpeg
png
webp
mp4
mov
pdf
doc
docx
```

### Storage Buckets

```text
bug-attachments
project-files
profile-images
invoice-files
```

### Attachment Fields

```text
id
bug_id
uploaded_by
file_name
file_url
file_type
file_size
created_at
```

## 8.9 Activity Timeline Module

### Purpose

Every important bug action should be tracked.

### Activities to Track

```text
Bug created
Status changed
Priority changed
Severity changed
Comment added
Attachment uploaded
Bug assigned
Bug sent for client review
Bug approved by client
Bug reopened by client
Bug rejected
```

### Activity Fields

```text
id
bug_id
user_id
action
old_value
new_value
created_at
```

### UI Requirements

- Show timeline on bug detail page.
- Show newest or oldest order consistently.
- Use readable labels.

Example:

```text
Sai changed status from New to In Progress
Client added a comment
Bug was approved and closed
```

## 8.10 Invoice Module

### Purpose

Freelancers can track project payments and invoices.

### MVP Features

- Create invoice
- Add invoice amount
- Add due date
- Set invoice status
- View invoices by client/project
- Client can view invoices

### Later Features

- Generate PDF invoice
- Razorpay payment integration
- Payment reminders
- Invoice email notification

### Invoice Fields

```text
id
client_id
project_id
invoice_number
amount
tax
discount
total
status
due_date
created_at
updated_at
```

### Invoice Status

```text
draft
sent
paid
overdue
cancelled
```

## 8.11 Notification Module

### MVP Notifications

In-app notifications for:

```text
New bug reported
New comment added
Bug status changed
Bug sent for client review
Bug approved
Bug reopened
Invoice created
```

### Notification Fields

```text
id
user_id
title
message
type
is_read
created_at
```

### Later Notifications

- Email notification using Resend or SendGrid.
- Reminder notifications.

## 8.12 Admin Module

### Admin Pages

```text
/admin/dashboard
/admin/users
/admin/projects
/admin/bugs
/admin/subscriptions
```

### Admin Features

- View all users.
- View all projects.
- View all bugs.
- Activate/deactivate users.
- View platform statistics.
- Manage subscription plans later.

## 9. Pages and Routes

### 9.1 Public Pages

```text
/
/login
/register
/features
/pricing
/contact
```

### 9.2 Freelancer Pages

```text
/freelancer/dashboard
/freelancer/clients
/freelancer/clients/[id]
/freelancer/projects
/freelancer/projects/[id]
/freelancer/bugs
/freelancer/bugs/[id]
/freelancer/invoices
/freelancer/settings
```

### 9.3 Client Pages

```text
/client/dashboard
/client/projects
/client/projects/[id]
/client/bugs
/client/bugs/[id]
/client/invoices
/client/settings
```

### 9.4 Admin Pages

```text
/admin/dashboard
/admin/users
/admin/projects
/admin/bugs
/admin/subscriptions
```

### 9.5 Public Bug Report Page Later

```text
/report/[projectToken]
```

This allows a client to report bugs using a shared link.

## 10. Database Requirements

Use Supabase PostgreSQL.

### Required Tables for MVP

```text
profiles
clients
projects
bugs
bug_comments
bug_attachments
bug_activity_logs
invoices
notifications
```

### Future Tables

```text
invoice_items
subscriptions
payments
project_invites
github_integrations
public_report_links
```

## 11. SQL Schema

### 11.1 profiles

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('freelancer', 'client', 'admin')),
  avatar_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 11.2 clients

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid references profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company_name text,
  notes text,
  status text default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 11.3 projects

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  description text,
  tech_stack text,
  project_url text,
  github_url text,
  status text default 'active' check (status in ('planning', 'active', 'testing', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  deadline date,
  budget numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 11.4 bugs

```sql
create table bugs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  reported_by uuid references profiles(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  browser_info text,
  device_info text,
  page_url text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  severity text default 'minor' check (severity in ('minor', 'major', 'critical', 'blocker')),
  status text default 'new' check (status in ('new', 'accepted', 'in_progress', 'fixed', 'client_review', 'reopened', 'closed', 'rejected')),
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 11.5 bug_comments

```sql
create table bug_comments (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid references bugs(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  comment text not null,
  created_at timestamp with time zone default now()
);
```

### 11.6 bug_attachments

```sql
create table bug_attachments (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid references bugs(id) on delete cascade,
  uploaded_by uuid references profiles(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size numeric,
  created_at timestamp with time zone default now()
);
```

### 11.7 bug_activity_logs

```sql
create table bug_activity_logs (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid references bugs(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone default now()
);
```

### 11.8 invoices

```sql
create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  invoice_number text not null unique,
  amount numeric default 0,
  tax numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### 11.9 notifications

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);
```

## 12. Row Level Security Requirements

Enable RLS before production.

### General Rules

- Freelancers can access only their own clients, projects, bugs, invoices, and related data.
- Clients can access only projects assigned to them.
- Clients can access only bugs under their assigned projects.
- Admin can access all data.
- Users can view and update only their own profile, except admin.

### RLS Can Be Implemented After MVP CRUD Works

For initial development, basic CRUD can be built first. Before deployment, RLS policies must be added.

## 13. Storage Requirements

Use Supabase Storage.

### Buckets

```text
profile-images
bug-attachments
project-files
invoice-files
```

### File Upload Rules

- Max file size: 10 MB for images/documents.
- Max file size: 50 MB for videos.
- Allowed image types: jpg, jpeg, png, webp.
- Allowed document types: pdf, doc, docx.
- Allowed video types: mp4, mov.

## 14. Tech Stack

### Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
Zustand
Lucide React
```

### Backend / Database

```text
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Supabase Realtime later
```

### Deployment

```text
Vercel
Supabase
```

### Future Integrations

```text
Resend or SendGrid for email
Razorpay for payments
GitHub API for repo/issue linking
OpenAI API for AI bug formatting
```

## 15. Recommended Folder Structure

```text
src/
  app/
    (auth)/
      login/
        page.tsx
      register/
        page.tsx

    (public)/
      page.tsx
      features/
        page.tsx
      pricing/
        page.tsx
      contact/
        page.tsx

    freelancer/
      dashboard/
        page.tsx
      clients/
        page.tsx
      clients/[id]/
        page.tsx
      projects/
        page.tsx
      projects/[id]/
        page.tsx
      bugs/
        page.tsx
      bugs/[id]/
        page.tsx
      invoices/
        page.tsx
      settings/
        page.tsx

    client/
      dashboard/
        page.tsx
      projects/
        page.tsx
      projects/[id]/
        page.tsx
      bugs/
        page.tsx
      bugs/[id]/
        page.tsx
      invoices/
        page.tsx
      settings/
        page.tsx

    admin/
      dashboard/
        page.tsx
      users/
        page.tsx
      projects/
        page.tsx
      bugs/
        page.tsx
      subscriptions/
        page.tsx

  components/
    common/
    layout/
    forms/
    tables/
    dialogs/
    cards/

  features/
    auth/
      components/
      services/
      validations/
      types/
    clients/
      components/
      services/
      validations/
      types/
    projects/
      components/
      services/
      validations/
      types/
    bugs/
      components/
      services/
      validations/
      types/
    invoices/
      components/
      services/
      validations/
      types/
    notifications/
      components/
      services/
      types/

  hooks/
    auth/
    queries/
    mutations/

  lib/
    supabase/
      client.ts
    validations/
    utils.ts

  stores/
    auth-store.ts

  constants/
    routes.ts
    roles.ts
    statuses.ts

  types/
    common.types.ts
```

## 16. Coding Standards

Follow these standards strictly:

- Use TypeScript everywhere.
- Use PascalCase for components and types.
- Use camelCase for variables and functions.
- Keep components presentational where possible.
- Move Supabase queries into service files.
- Move reusable logic into hooks.
- Use React Hook Form for forms.
- Use Zod for validation.
- Use Tailwind CSS for styling.
- Use `cn()` utility for conditional class names.
- Avoid unnecessary `useMemo`.
- Avoid prop drilling when global state is needed; use Zustand.
- Keep files small and modular.
- Add comments only for complex logic.
- Use meaningful names for files, variables, and functions.

### Preferred Pattern

```text
Page file = data fetching, state, handlers
Component file = UI only
Service file = Supabase queries
Validation file = Zod schema
Types file = TypeScript interfaces/types
Constants file = fixed values
```

## 17. UI/UX Requirements

### General Design

- Clean SaaS-style interface.
- Modern dashboard layout.
- Responsive design for desktop, tablet, and mobile.
- Use sidebar navigation for logged-in dashboards.
- Use topbar with search, notifications, and profile menu.
- Use cards for statistics.
- Use tables for clients, projects, bugs, and invoices.
- Use badges for status, priority, and severity.
- Use dialogs or side panels for quick create/edit forms.

### Freelancer Sidebar

```text
Dashboard
Clients
Projects
Bugs
Invoices
Settings
```

### Client Sidebar

```text
Dashboard
My Projects
Report Bug
My Bugs
Invoices
Settings
```

### Admin Sidebar

```text
Dashboard
Users
Projects
Bugs
Subscriptions
```

### Status Badge Colors

Use clear colors:

```text
new: gray
accepted: blue
in_progress: yellow
fixed: purple
client_review: orange
reopened: red
closed: green
rejected: dark gray
```

### Priority Badge Colors

```text
low: gray
medium: blue
high: orange
urgent: red
```

### Severity Badge Colors

```text
minor: gray
major: orange
critical: red
blocker: dark red
```

## 18. Form Validation Requirements

Use Zod validation.

### Register Validation

- Full name is required.
- Email must be valid.
- Password must be at least 6 characters.
- Role is required.

### Client Form Validation

- Client name is required.
- Email must be valid.
- Phone is optional.
- Company name is optional.

### Project Form Validation

- Project name is required.
- Client is required.
- Deadline is optional.
- Budget must be a positive number if provided.

### Bug Form Validation

- Project is required.
- Title is required.
- Description is required.
- Priority is required.
- Severity is required.
- Status should default to `new`.

### Invoice Form Validation

- Client is required.
- Project is required.
- Amount must be valid.
- Due date is required.

## 19. MVP Scope

Build the MVP in this order.

### MVP Phase 1: Project Setup and Auth

```text
Create Next.js project
Setup Tailwind CSS
Setup shadcn/ui
Setup Supabase
Create database tables
Create login page
Create register page
Create profiles after signup
Role-based redirect
Protected routes
Dashboard layouts
```

### MVP Phase 2: Client and Project Management

```text
Freelancer can create client
Freelancer can view clients
Freelancer can edit/archive clients
Freelancer can create project
Freelancer can assign project to client
Client can view assigned projects
```

### MVP Phase 3: Bug Tracking

```text
Freelancer can create bug
Client can report bug
Bug list page
Bug detail page
Update bug status
Update priority/severity
Add comments
Upload attachments
```

### MVP Phase 4: Client Review Flow

```text
Freelancer marks bug as fixed
Freelancer sends bug to client review
Client approves bug
Client reopens bug
Activity timeline updates
Notifications created
```

### MVP Phase 5: Invoice and Dashboard

```text
Freelancer creates invoice
Client views invoice
Update invoice status
Dashboard statistics
UI polish
Responsive testing
Deployment
README documentation
```

## 20. Features Not Required in MVP

Do not build these in the first version:

```text
AI bug formatter
GitHub integration
Razorpay integration
Advanced subscription plans
Advanced analytics charts
Public bug report link
Email notifications
PDF invoice generation
Team collaboration
Multiple freelancers per project
```

These can be added after MVP.

## 21. Future Enhancements

After MVP, add:

### 21.1 Public Bug Report Link

Freelancer can generate a project-specific public link:

```text
/report/[projectToken]
```

Client can report bugs without full login.

### 21.2 Auto Browser and Device Capture

When reporting a bug, automatically capture:

```text
Browser
Operating system
Screen size
Device type
Current page URL
Timestamp
```

### 21.3 AI Bug Formatter

Client writes simple text, and AI converts it into structured bug details:

```text
Title
Steps to reproduce
Expected result
Actual result
Priority suggestion
```

### 21.4 GitHub Integration

Link bugs to:

```text
GitHub issue URL
Pull request URL
Commit URL
```

### 21.5 Razorpay Integration

Allow clients to pay invoices online.

### 21.6 PDF Invoice Generation

Generate downloadable invoice PDFs.

### 21.7 Email Notifications

Send emails for:

```text
New bug reported
Bug fixed
Bug approved
Bug reopened
Invoice sent
Payment reminder
```

## 22. Acceptance Criteria

The project is considered successful when:

- Freelancer can register and login.
- Client can register and login.
- User profile is created in database after signup.
- Role-based dashboards work correctly.
- Freelancer can create clients.
- Freelancer can create projects.
- Client can view assigned projects.
- Client can report bugs.
- Freelancer can view and update bugs.
- Comments work on bug details.
- Attachments can be uploaded and viewed.
- Bug status workflow works correctly.
- Client can approve or reopen bugs.
- Activity timeline records important actions.
- Freelancer can create invoices.
- Client can view invoices.
- Dashboard cards show correct counts.
- Application is responsive.
- Application is deployed successfully.
- README explains project setup and features clearly.

## 23. README Requirements

The README should include:

```text
Project title
Project description
Problem statement
Features
Tech stack
Screenshots
Database schema summary
Environment variables
Installation steps
How to run locally
Demo credentials
Folder structure
Future improvements
```

## 24. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Future:

```env
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## 25. Final Build Instruction for AI

Build FixFlow as a production-quality full-stack SaaS web application using Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, Supabase PostgreSQL, and Supabase Storage.

The application must have three roles: freelancer, client, and admin. It must include role-based dashboards, client management, project management, bug tracking, comments, attachments, activity timeline, client approval/reopen flow, invoice tracking, notifications, and responsive UI.

The design should be clean, modern, professional, and easy to use. The client portal should be very simple and non-technical. The freelancer dashboard should be powerful and organized. The code should be modular, typed, reusable, and follow clean architecture with separate services, components, validations, types, constants, and hooks.

The first priority is to complete the MVP workflow:

```text
Freelancer creates client
↓
Freelancer creates project
↓
Client reports bug
↓
Freelancer fixes bug
↓
Client approves or reopens bug
↓
Bug is closed
↓
Invoice is tracked
```
