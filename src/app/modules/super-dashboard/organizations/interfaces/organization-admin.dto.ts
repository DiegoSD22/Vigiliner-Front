export interface OrganizationUserRoleDto {
  role: {
    id: string;
    name: string;
    slug: string;
    scope: string;
    isSystem: boolean;
  };
}

export interface OrganizationAdminDto {
  id: string;
  email: string;
  username: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  roles: OrganizationUserRoleDto[];
}

export interface CreateOrganizationAdminDto {
  email: string;
  username?: string;
  name: string;
  password: string;
  roleSlugs?: string[];
}

export interface UpdateOrganizationAdminDto {
  email?: string;
  username?: string;
  name?: string;
  password?: string;
  roleSlugs?: string[];
}
