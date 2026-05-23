export const ROLES = ['freelancer', 'client', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = 'freelancer';

export const ROLE_LABELS: Record<Role, string> = {
  freelancer: 'Freelancer',
  client: 'Client',
  admin: 'Admin'
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  freelancer: 'Manage clients, projects, bugs, and invoices.',
  client: 'Report bugs, review fixes, and track invoices.',
  admin: 'Monitor the platform and all user activity.'
};

export const DASHBOARD_PATHS = {
  freelancer: '/freelancer/dashboard',
  client: '/client/dashboard',
  admin: '/admin/dashboard'
} as const;
