import { DASHBOARD_PATHS, type Role } from '@/constants/roles';
import type { NavItem } from '@/types/common.types';

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  features: '/features',
  pricing: '/pricing',
  contact: '/contact',
  dashboard: DASHBOARD_PATHS,
  freelancer: {
    dashboard: '/freelancer/dashboard',
    clients: '/freelancer/clients',
    projects: '/freelancer/projects',
    bugs: '/freelancer/bugs',
    invoices: '/freelancer/invoices',
    settings: '/freelancer/settings'
  },
  client: {
    dashboard: '/client/dashboard',
    projects: '/client/projects',
    bugs: '/client/bugs',
    invoices: '/client/invoices',
    settings: '/client/settings'
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    projects: '/admin/projects',
    bugs: '/admin/bugs',
    subscriptions: '/admin/subscriptions'
  }
} as const;

const PROTECTED_PREFIXES = ['/freelancer', '/client', '/admin'] as const;
const AUTH_PATHS = [ROUTES.login, ROUTES.register] as const;

export function getDashboardRoute(role: Role): (typeof ROUTES.dashboard)[Role] {
  return ROUTES.dashboard[role];
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthRoute(pathname: string) {
  return (AUTH_PATHS as readonly string[]).includes(pathname);
}

export function getRoleNavItems(role: Role): NavItem[] {
  if (role === 'freelancer') {
    return [
      { label: 'Dashboard', href: ROUTES.freelancer.dashboard, description: 'Overview' },
      { label: 'Clients', href: ROUTES.freelancer.clients, description: 'Manage clients' },
      { label: 'Projects', href: ROUTES.freelancer.projects, description: 'Manage projects' },
      { label: 'Bugs', href: ROUTES.freelancer.bugs, description: 'Track issues' },
      { label: 'Invoices', href: ROUTES.freelancer.invoices, description: 'Track payment' },
      { label: 'Settings', href: ROUTES.freelancer.settings, description: 'Profile settings' }
    ];
  }

  if (role === 'client') {
    return [
      { label: 'Dashboard', href: ROUTES.client.dashboard, description: 'Overview' },
      { label: 'My Projects', href: ROUTES.client.projects, description: 'Assigned work' },
      { label: 'Report Bug', href: ROUTES.client.bugs, description: 'Share an issue' },
      { label: 'My Bugs', href: ROUTES.client.bugs, description: 'Track progress' },
      { label: 'Invoices', href: ROUTES.client.invoices, description: 'View invoices' },
      { label: 'Settings', href: ROUTES.client.settings, description: 'Profile settings' }
    ];
  }

  return [
    { label: 'Dashboard', href: ROUTES.admin.dashboard, description: 'Platform overview' },
    { label: 'Users', href: ROUTES.admin.users, description: 'Manage users' },
    { label: 'Projects', href: ROUTES.admin.projects, description: 'Monitor projects' },
    { label: 'Bugs', href: ROUTES.admin.bugs, description: 'Review bugs' },
    { label: 'Subscriptions', href: ROUTES.admin.subscriptions, description: 'Billing plans' }
  ];
}
