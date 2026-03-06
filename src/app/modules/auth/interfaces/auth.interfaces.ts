export type AuthRole = 'super-admin' | 'admin' | string;

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: AuthRole;
  roles?: AuthRole[];
  organizationId?: string;
  organization?: OrganizationSummary;
  createdAt?: string;
}

export interface LoginResponseData {
  user: AuthUser;
  accessToken: string;
  tokenType?: string;
  roles?: AuthRole[];
  permissions?: string[];
  primaryRole?: AuthRole;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  tokenType?: string;
  roles?: AuthRole[];
  permissions?: string[];
  primaryRole?: AuthRole;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  username?: string;
}
