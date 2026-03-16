import { ApiResponse } from '@vigiliner/core/interfaces/api-response.interface';

export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface OrganizationCountDto {
  users: number;
  roles?: number;
}

export interface OrganizationDto {
  id: string;
  name: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: OrganizationCountDto;
}

export interface CreateOrganizationDto {
  name: string;
  status?: OrganizationStatus;
}

export interface UpdateOrganizationDto {
  name?: string;
  status?: OrganizationStatus;
}

export type FindAllOrganizationsResponseDto = ApiResponse<OrganizationDto[]>;
export type FindOneOrganizationResponseDto = ApiResponse<OrganizationDto>;
export type CreateOrganizationResponseDto = ApiResponse<OrganizationDto>;
export type UpdateOrganizationResponseDto = ApiResponse<OrganizationDto>;
export type RemoveOrganizationResponseDto = ApiResponse<{ id: string }>;
