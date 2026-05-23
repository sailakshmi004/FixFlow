import type { Role } from '@/constants/roles';

export type AuthFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = AuthFormValues & {
  fullName: string;
  confirmPassword: string;
  role: Role;
};

export type AuthSessionProfile = {
  fullName: string;
  email: string;
  role: Role;
};

