export type OrganizationAdminStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export interface OrganizationAdminDto {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  status: OrganizationAdminStatus;
  lastAccessAt: string | null;
}

export interface CreateOrganizationAdminDto {
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  status: OrganizationAdminStatus;
}
