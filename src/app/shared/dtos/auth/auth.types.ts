/**
 * Tipos base de autenticación
 * Reutilizables en toda la aplicación
 */

export type AuthRole = 'super-admin' | 'admin' | string;

export interface IOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: AuthRole;
  roles?: AuthRole[];
  organizationId?: string;
  organization?: IOrganizationSummary;
  createdAt?: string;
}
