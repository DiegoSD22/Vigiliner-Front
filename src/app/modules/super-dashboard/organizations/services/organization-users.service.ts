import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ApiResponse } from '@vigiliner/core/interfaces/api-response.interface';
import { environment } from '@vigiliner/env/environment';

import {
  CreateOrganizationAdminDto,
  OrganizationAdminDto,
  UpdateOrganizationAdminDto,
} from '../interfaces/organization-admin.dto';

@Injectable({
  providedIn: 'root',
})
export class OrganizationUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseEndpoint = `${environment.API_URL}/api/v1/organizations`;

  findAll(organizationId: string) {
    return this.http.get<ApiResponse<OrganizationAdminDto[]>>(
      `${this.baseEndpoint}/${organizationId}/users`
    );
  }

  create(organizationId: string, payload: CreateOrganizationAdminDto) {
    return this.http.post<ApiResponse<OrganizationAdminDto>>(
      `${this.baseEndpoint}/${organizationId}/users`,
      payload
    );
  }

  update(organizationId: string, userId: string, payload: UpdateOrganizationAdminDto) {
    return this.http.patch<ApiResponse<OrganizationAdminDto>>(
      `${this.baseEndpoint}/${organizationId}/users/${userId}`,
      payload
    );
  }

  remove(organizationId: string, userId: string) {
    return this.http.delete<ApiResponse<{ id: string }>>(
      `${this.baseEndpoint}/${organizationId}/users/${userId}`
    );
  }
}
