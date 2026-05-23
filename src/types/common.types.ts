import type { Role } from '@/constants/roles';

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  description?: string;
};

export type DashboardKey = Role;

export type OptionItem<T extends string = string> = {
  label: string;
  value: T;
};

